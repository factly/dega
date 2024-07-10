package policy

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/arrays"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// update - Update policy
// @Summary Update policy
// @Description Update policy
// @Tags Policy
// @ID update-policy
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Policy body policyReq true "Policy Object"
// @Param policy_id path string true "Policy ID"
// @Success 200 {object} model.Policy
// @Router /core/policies/{policy_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

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

	policyReq := policyReq{}

	err = json.NewDecoder(r.Body).Decode(&policyReq)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	// check whether user is admin or not
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
		if err == gorm.ErrRecordNotFound {
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
			return
		}
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	permissions := make([]model.Permission, 0)
	policyUsers := make([]model.PolicyUser, 0)

	err = config.DB.Model(&model.Permission{}).Where(&model.Permission{
		PolicyID: pID,
	}).Find(&permissions).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	err = config.DB.Model(&model.PolicyUser{}).Where(&model.PolicyUser{
		PolicyID: pID,
	}).Find(&policyUsers).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Convert existing policies to a map for easy lookup
	existingPermissionMap := make(map[string]uuid.UUID)
	existingUsers := make([]string, 0)

	for _, permission := range permissions {
		key := fmt.Sprintf("%s:%s", permission.Resource, permission.Action)
		existingPermissionMap[key] = permission.ID
	}

	for _, user := range policyUsers {
		existingUsers = append(existingUsers, user.UserID)
	}

	policiesToAdd := make([]model.Permission, 0)
	policiesToDelete := make([]uuid.UUID, 0)

	usersToAdd, usersToDelete := arrays.Difference(existingUsers, policyReq.Users)

	// Convert new policies to a map for easy lookup
	incomingPermissionMap := make(map[string]model.Permission)
	for _, permission := range policyReq.Permissions {
		for _, action := range permission.Actions {
			key := fmt.Sprintf("%s:%s", permission.Resource, action)
			permission := model.Permission{
				Resource: permission.Resource,
				Action:   action,
				PolicyID: pID,
			}

			if _, exists := existingPermissionMap[key]; !exists {
				policiesToAdd = append(policiesToAdd, permission)
			} else {
				permission.ID = existingPermissionMap[key]
			}
			incomingPermissionMap[key] = permission
		}
	}

	for key, permission := range incomingPermissionMap {
		if _, exists := incomingPermissionMap[key]; !exists {
			policiesToDelete = append(policiesToDelete, permission.ID)
		}
	}

	policyUsersToAdd := make([]model.PolicyUser, 0)

	for _, user := range usersToAdd {
		policyUser := model.PolicyUser{
			PolicyID: pID,
			UserID:   user,
		}
		policyUsersToAdd = append(policyUsersToAdd, policyUser)
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), config.UserContext, authCtx.UserID)).Begin()

	// update policy
	err = tx.Model(&model.Policy{}).Where(&model.Policy{
		Base: config.Base{ID: pID},
	}).Updates(&model.Policy{Name: policyReq.Name, Description: policyReq.Description}).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Add new permissions

	if len(policiesToAdd) > 0 {
		err = tx.Model(&model.Permission{}).Create(&policiesToAdd).Error

		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// Delete old permissions

	if len(policiesToDelete) > 0 {
		err = tx.Model(&model.Permission{}).Delete(&model.Permission{}, policiesToDelete).Error

		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// Add new users

	err = tx.Model(&model.PolicyUser{}).Create(&policyUsersToAdd).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Delete old users

	err = tx.Model(&model.PolicyUser{}).Where("policy_id = ? and user_id IN ?", pID, usersToDelete).Delete(&model.PolicyUser{}).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()

	p := make([]permission, 0)

	resourceMap := make(map[string][]string)

	for _, permission := range permissions {
		if _, found := resourceMap[permission.Resource]; !found {
			resourceMap[permission.Resource] = make([]string, 0)
		}
		resourceMap[permission.Resource] = append(resourceMap[permission.Resource], permission.Action)
	}

	result := policyRes{
		ID:          policy.ID,
		Name:        policy.Name,
		Description: policy.Description,
		Permissions: p,
		Users:       []policyUser{},
	}

	renderx.JSON(w, http.StatusOK, result)
}
