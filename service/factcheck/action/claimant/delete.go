package claimant

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// delete - Delete claimant by id
// @Summary Delete a claimant
// @Description Delete claimant by ID
// @Tags Claimant
// @ID delete-claimant-by-id
// @Param X-User header string true "User ID"
// @Param claimant_id path string true "Claimant ID"
// @Success 200
// @Router /factcheck/claimants/{claimant_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	claimantID := chi.URLParam(r, "claimant_id")
	id, err := strconv.Atoi(claimantID)

	result := &model.Claimant{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Model(&model.Claimant{}).First(&result).Error

	if err != nil {
		return
	}

	config.DB.Model(&model.Claimant{}).Delete(&result)

	render.JSON(w, http.StatusOK, nil)
}
