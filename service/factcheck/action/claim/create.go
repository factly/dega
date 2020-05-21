package claim

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
)

// create - Create claim
// @Summary Create claim
// @Description Create claim
// @Tags Claim
// @ID add-claim
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param Claim body claim true "Claim Object"
// @Success 201 {object} model.Claim
// @Router /factcheck/claims [post]
func create(w http.ResponseWriter, r *http.Request) {

	claim := &claim{}

	json.NewDecoder(r.Body).Decode(&claim)

	result := &model.Claim{
		Title:         claim.Title,
		Slug:          claim.Slug,
		ClaimDate:     claim.ClaimDate,
		CheckedDate:   claim.CheckedDate,
		ClaimSources:  claim.ClaimSources,
		Description:   claim.Description,
		ClaimantID:    claim.ClaimantID,
		RatingID:      claim.RatingID,
		Review:        claim.Review,
		ReviewTagLine: claim.ReviewTagLine,
		ReviewSources: claim.ReviewSources,
		SpaceID:       claim.SpaceID,
	}

	err := config.DB.Model(&model.Claim{}).Create(&result).Error

	if err != nil {
		return
	}

	config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Claimant").Preload("Rating.Medium").Preload("Claimant.Medium").Find(&result)

	render.JSON(w, http.StatusCreated, result)
}
