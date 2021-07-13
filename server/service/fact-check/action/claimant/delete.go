package claimant

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete claimant by id
// @Summary Delete a claimant
// @Description Delete claimant by ID
// @Tags Claimant
// @ID delete-claimant-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param claimant_id path string true "Claimant ID"
// @Success 200
// @Router /fact-check/claimants/{claimant_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	claimantID := chi.URLParam(r, "claimant_id")
	id, err := strconv.Atoi(claimantID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Claimant{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Model(&model.Claimant{}).Where(&model.Claimant{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// check if claimant is associated with claims
	var totAssociated int64
	config.DB.Model(&model.Claim{}).Where(&model.Claim{
		ClaimantID: uint(id),
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("claimant is associated with claim"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("claimant", "claim")))
		return
	}

	tx := config.DB.Begin()
	tx.Model(&model.Claimant{}).Delete(&result)

	_ = meilisearchx.DeleteDocument("dega", result.ID, "claimant")

	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("claimant.deleted", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, nil)
}
