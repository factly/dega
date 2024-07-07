package policy

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/zitadel"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

// details - Get policy by ID
// @Summary Get policy by ID
// @Description Get policy by ID
// @Tags Policy
// @ID get-policy-by-id
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param policy_id path string true "Policy ID"
// @Success 200 {object} model.Policy
// @Router /core/policies/{policy_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	policyId := chi.URLParam(r, "policy_id")
	pID, err := uuid.Parse(policyId)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	orgRole := authCtx.OrgRole

	if orgRole != "admin" {
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	policy := model.Policy{
		Base: config.Base{ID: pID},
	}

	err = config.DB.Model(&model.Policy{}).Where(&model.Policy{
		SpaceID: authCtx.SpaceID,
	}).First(&policy).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	permissions := make([]model.Permission, 0)

	err = config.DB.Model(&model.Permission{}).Where(&model.Permission{
		PolicyID: pID,
	}).Find(&permissions).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	policyUsers := make([]model.PolicyUser, 0)

	err = config.DB.Model(&model.PolicyUser{}).Where(&model.PolicyUser{
		PolicyID: pID,
	}).Find(&policyUsers).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	uIDs := make([]string, 0)

	for _, policyUser := range policyUsers {
		uIDs = append(uIDs, policyUser.UserID)
	}

	users, err := zitadel.GetOrganisationUsers(r.Header.Get("Authorisation"), authCtx.OrganisationID, uIDs)

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if len(users) != len(uIDs) {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	p := make([]permission, 0)

	resourceMap := make(map[string][]string)

	for _, permission := range permissions {
		if _, found := resourceMap[permission.Resource]; !found {
			resourceMap[permission.Resource] = make([]string, 0)
		}
		resourceMap[permission.Resource] = append(resourceMap[permission.Resource], permission.Action)
	}

	for key, value := range resourceMap {
		p = append(p, permission{
			Resource: key,
			Actions:  value,
		})
	}

	result := policyRes{
		ID:          policy.ID,
		Name:        policy.Name,
		Description: policy.Description,
		Permissions: p,
		Users:       []policyUser{},
	}

	for _, user := range users {
		result.Users = append(result.Users, policyUser{
			UserID:      user.ID,
			DisplayName: user.Human.Profile.DisplayName,
		})
	}

	renderx.JSON(w, http.StatusOK, result)
}
