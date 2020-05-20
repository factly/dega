package claimant

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// update - Update claimant by id
// @Summary Update a claimant by id
// @Description Update claimant by ID
// @Tags Claimant
// @ID update-claimant-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param claimant_id path string true "Claimant ID"
// @Param Claimant body claimant false "Claimant"
// @Success 200 {object} model.Claimant
// @Router /factcheck/claimants/{claimant_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	claimantID := chi.URLParam(r, "claimant_id")
	id, err := strconv.Atoi(claimantID)

	if err != nil {
		return
	}

	req := &model.Claimant{}
	json.NewDecoder(r.Body).Decode(&req)

	claimant := &model.Claimant{}
	claimant.ID = uint(id)

	config.DB.Model(&model.Claimant{}).Updates(model.Claimant{
		Name:        req.Name,
		Slug:        req.Slug,
		MediumID:    req.MediumID,
		TagLine:     req.TagLine,
		Description: req.Description,
	}).Preload("Medium").First(&claimant)

	render.JSON(w, http.StatusOK, claimant)
}
