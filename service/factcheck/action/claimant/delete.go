package claimant

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
	"github.com/go-chi/chi"
)

// delete - Delete claimant by id
// @Summary Delete a claimant
// @Description Delete claimant by ID
// @Tags Claimant
// @ID delete-claimant-by-id
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param claimant_id path string true "Claimant ID"
// @Success 200
// @Router /{space_id}/factcheck/claimants/{claimant_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	claimantID := chi.URLParam(r, "claimant_id")
	id, err := strconv.Atoi(claimantID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	result := &model.Claimant{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Model(&model.Claimant{}).Where(&model.Claimant{
		SpaceID: uint(sid),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	config.DB.Model(&model.Claimant{}).Delete(&result)

	render.JSON(w, http.StatusOK, nil)
}
