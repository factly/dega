package claimant

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
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
// @Router /factcheck/claimants/{claimant_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	claimantID := chi.URLParam(r, "claimant_id")
	id, err := strconv.Atoi(claimantID)

	if err != nil {
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
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// check if claimant is associated with claims
	var totAssociated int
	config.DB.Model(&model.Claim{}).Where(&model.Claim{
		SpaceID:    uint(sID),
		ClaimantID: uint(id),
	}).Count(&totAssociated)

	if totAssociated != 0 {
		errorx.Render(w, errorx.Parser(util.CannotDeleteError()))
		return
	}

	config.DB.Model(&model.Claimant{}).Delete(&result)

	renderx.JSON(w, http.StatusOK, nil)
}
