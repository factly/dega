package factcheck

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
	"github.com/go-chi/chi"
)

// details - Get factcheck by id
// @Summary Show a factcheck by id
// @Description Get factcheck by ID
// @Tags Factcheck
// @ID get-factcheck-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param factcheck_id path string true "Factcheck ID"
// @Success 200 {object} factcheckData
// @Router /{space_id}/factcheck/factchecks/{factcheck_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	factcheckID := chi.URLParam(r, "factcheck_id")
	id, err := strconv.Atoi(factcheckID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	if err != nil {
		return
	}

	result := &factcheckData{}
	categories := []model.FactcheckCategory{}
	tags := []model.FactcheckTag{}
	claims := []model.FactcheckClaim{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Factcheck{}).Preload("Medium").Where(&model.Factcheck{
		SpaceID: uint(sid),
	}).First(&result.Factcheck).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	// fetch all categories
	config.DB.Model(&model.FactcheckCategory{}).Where(&model.FactcheckCategory{
		FactcheckID: uint(id),
	}).Preload("Category").Preload("Category.Medium").Find(&categories)

	// fetch all tags
	config.DB.Model(&model.FactcheckTag{}).Where(&model.FactcheckTag{
		FactcheckID: uint(id),
	}).Preload("Tag").Find(&tags)

	// fetch all claims
	config.DB.Model(&model.FactcheckClaim{}).Where(&model.FactcheckClaim{
		FactcheckID: uint(id),
	}).Preload("Claim").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Find(&claims)

	for _, c := range categories {
		result.Categories = append(result.Categories, c.Category)
	}

	for _, t := range tags {
		result.Tags = append(result.Tags, t.Tag)
	}

	for _, c := range claims {
		result.Claims = append(result.Claims, c.Claim)
	}

	render.JSON(w, http.StatusOK, result)
}
