package policy

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/zitadel"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// create - Create policy
// @Summary Create policy
// @Description Create policy
// @Tags Policy
// @ID add-policy
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Policy body policyReq true "Policy Object"
// @Success 201 {object} model.Policy
// @Router /core/policies [post]
func create(w http.ResponseWriter, r *http.Request) {

	log.Println("Checking policy for entity: ", "policies", " action: ", "create")

	spaceID, err := util.GetSpace(r.Context())

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	userID, err := util.GetUser(r.Context())

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	organisationID, err := util.GetOrganisation(r.Context())

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	orgRole, err := util.GetOrgRoleFromContext(r.Context())

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// check whether user is admin or not
	if orgRole != "admin" {
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	policyReq := policyReq{}

	err = json.NewDecoder(r.Body).Decode(&policyReq)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	policy := model.Policy{
		Name:        policyReq.Name,
		Description: policyReq.Description,
		SpaceID:     spaceID,
	}

	policyUsers := make([]model.PolicyUser, 0)
	uIDs := make([]string, 0)

	for _, userID := range policyReq.Users {
		policyUser := model.PolicyUser{
			PolicyID: policy.ID,
			UserID:   userID,
		}
		policyUsers = append(policyUsers, policyUser)

		uIDs = append(uIDs, userID)
	}

	users, err := zitadel.GetOrganisationUsers(r.Header.Get("Authorization"), organisationID, uIDs)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if len(users) != len(uIDs) {
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, userID)).Begin()
	err = tx.Model(&model.Policy{}).Create(&policy).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	err = tx.Model(&model.PolicyUser{}).Create(&policyUsers).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	permissions := make([]model.Permission, 0)

	for _, permission := range policyReq.Permissions {
		for _, action := range permission.Actions {
			policyPermission := model.Permission{
				PolicyID: policy.ID,
				Action:   action,
				Resource: permission.Resource,
			}
			permissions = append(permissions, policyPermission)
		}
	}

	err = tx.Model(&model.Permission{}).Create(&permissions).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()

	result := &policyRes{
		ID:          policy.ID,
		Name:        policy.Name,
		Description: policy.Description,
		Permissions: policyReq.Permissions,
		Users:       []policyUser{},
	}

	for _, user := range users {
		policyUser := policyUser{
			UserID:      user.ID,
			DisplayName: user.Human.Profile.DisplayName,
		}
		result.Users = append(result.Users, policyUser)
	}

	renderx.JSON(w, http.StatusOK, result)
}
