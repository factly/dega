package claimant

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// details - Get claimant by id
// @Summary Show a claimant by id
// @Description Get claimant by ID
// @Tags Claimant
// @ID get-claimant-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param claimant_id path string true "Claimant ID"
// @Success 200 {object} model.Claimant
// @Router /factcheck/claimants/{claimant_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	claimantID := chi.URLParam(r, "claimant_id")
	id, err := strconv.Atoi(claimantID)

	if err != nil {
		return
	}

	result := &model.Claimant{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Claimant{}).Preload("Medium").First(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
