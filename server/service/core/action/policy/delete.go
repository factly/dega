package policy

import (
	"context"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// delete - Delete policy by ID
// @Summary Delete policy by ID
// @Description GeDeletet policy by ID
// @Tags Policy
// @ID delete-policy-by-id
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param policy_id path string true "Policy ID"
// @Success 200 {object} model.Policy
// @Router /core/policies/{policy_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	policyId := chi.URLParam(r, "policy_id")
	pID, err := uuid.Parse(policyId)
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

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

	orgRole, err := util.GetOrgRoleFromContext(r.Context())

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// check if the user is admin or not
	if orgRole != "admin" {
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, userID)).Begin()

	policy := model.Policy{
		Base: config.Base{
			ID: pID,
		},
		SpaceID: spaceID,
	}

	// check record exists or not
	err = tx.Model(&model.Policy{}).First(&policy).Error

	if err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
			return
		}
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	err = tx.Model(&model.Policy{}).Delete(&policy).Error

	if err != nil {
		tx.Rollback()
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusOK, nil)
}
