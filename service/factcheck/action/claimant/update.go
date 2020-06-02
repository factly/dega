package claimant

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
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
// @Param space_id path string true "Space ID"
// @Param claimant_id path string true "Claimant ID"
// @Param Claimant body claimant false "Claimant"
// @Success 200 {object} model.Claimant
// @Router /{space_id}/factcheck/claimants/{claimant_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	claimantID := chi.URLParam(r, "claimant_id")
	id, err := strconv.Atoi(claimantID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	if err != nil {
		return
	}

	claimant := &model.Claimant{}
	json.NewDecoder(r.Body).Decode(&claimant)

	result := &model.Claimant{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Rating{
		SpaceID: uint(sid),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	config.DB.Model(&result).Updates(model.Claimant{
		Name:        claimant.Name,
		Slug:        claimant.Slug,
		MediumID:    claimant.MediumID,
		TagLine:     claimant.TagLine,
		Description: claimant.Description,
	}).Preload("Medium").First(&result)

	render.JSON(w, http.StatusOK, result)
}
