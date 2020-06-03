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

// details - Get claimant by id
// @Summary Show a claimant by id
// @Description Get claimant by ID
// @Tags Claimant
// @ID get-claimant-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param claimant_id path string true "Claimant ID"
// @Success 200 {object} model.Claimant
// @Router /{space_id}/factcheck/claimants/{claimant_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	claimantID := chi.URLParam(r, "claimant_id")
	id, err := strconv.Atoi(claimantID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	if err != nil {
		return
	}

	result := &model.Claimant{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Claimant{}).Preload("Medium").Where(&model.Claimant{
		SpaceID: uint(sid),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	render.JSON(w, http.StatusOK, result)
}
