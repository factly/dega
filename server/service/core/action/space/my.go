package space

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/zitadel"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

type organisation struct {
	ID     string                `json:"id"`
	Title  string                `json:"title"`
	Slug   string                `json:"slug"`
	Role   string                `json:"role"`
	Spaces []SpaceWithPermission `json:"spaces"`
}

type SpaceWithPermission struct {
	model.Space
	Permissions []premission `json:"permissions"`
}

type premission struct {
	Resource string   `json:"resource"`
	Actions  []string `json:"actions"`
}

// list - Get all spaces for a user
// @Summary Show all spaces
// @Description Get all spaces
// @Tags Space
// @ID get-all-spaces
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {array} orgWithSpace
// @Router /core/spaces [get]
func my(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// Fetched all organisations of the user
	orgs := zitadel.GetOrganisations(r.Header.Get("Authorization"))

	allOrg := []organisation{}

	for _, org := range orgs {
		organisation := organisation{
			ID:    org.ID,
			Title: org.Name,
			Role:  authCtx.OrgsRole[org.ID],
		}

		spaces := make([]model.Space, 0)
		config.DB.Model(&model.Space{}).Where("organisation_id = ?", org.ID).Find(&spaces)
		organisation.Spaces = make([]SpaceWithPermission, 0)
		for _, space := range spaces {
			spaceWithPermission := SpaceWithPermission{
				Space: space,
			}
			// check if user is member then fetch his permissions
			if authCtx.OrgsRole[org.ID] != "admin" {
				// check if the user is member of the space
				var spaceMember model.SpaceUser
				err = config.DB.Model(&model.SpaceUser{}).Where(&model.SpaceUser{
					SpaceID: space.ID,
					UserID:  authCtx.UserID,
				}).First(&spaceMember).Error

				if err != nil {
					if err == gorm.ErrRecordNotFound {
						break
					}
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
					return
				}

				// check for space policies
				var spacePolicies []model.Policy
				config.DB.Model(&model.Policy{}).Where(&model.Policy{
					SpaceID: space.ID,
				}).Find(&spacePolicies)

				policyIds := make([]uuid.UUID, 0)
				for _, policy := range spacePolicies {
					policyIds = append(policyIds, policy.ID)
				}

				// check for user policies
				var userPolicies []model.PolicyUser
				config.DB.Model(&model.PolicyUser{}).Where("policy_id IN (?)", policyIds).Where(&model.PolicyUser{
					UserID: authCtx.UserID,
				}).Find(&userPolicies)

				userAccessPolicies := make([]uuid.UUID, 0)
				for _, policy := range userPolicies {
					userAccessPolicies = append(userAccessPolicies, policy.PolicyID)
				}

				permissions := make([]premission, 0)

				spacePermission := make([]model.Permission, 0)

				config.DB.Model(&model.Permission{}).Where("policy_id IN ?", userAccessPolicies).Find(&spacePermission)

				resourceMap := make(map[string][]string)

				for _, permission := range spacePermission {
					if _, found := resourceMap[permission.Resource]; !found {
						resourceMap[permission.Resource] = make([]string, 0)
					}
					resourceMap[permission.Resource] = append(resourceMap[permission.Resource], permission.Action)
				}

				for key, value := range resourceMap {
					permissions = append(permissions, premission{
						Resource: key,
						Actions:  value,
					})
				}
				spaceWithPermission.Permissions = permissions
			}
			organisation.Spaces = append(organisation.Spaces, spaceWithPermission)
		}

		allOrg = append(allOrg, organisation)
	}

	renderx.JSON(w, http.StatusOK, allOrg)
}
