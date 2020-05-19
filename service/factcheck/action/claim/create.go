package claim

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
)

// create - Create claim
func create(w http.ResponseWriter, r *http.Request) {

	claim := &claim{}

	json.NewDecoder(r.Body).Decode(&claim)

	result := &model.Claim{
		Claim:           claim.Claim,
		Slug:            claim.Slug,
		ClaimDate:       claim.ClaimDate,
		CheckedDate:     claim.CheckedDate,
		ClaimSources:    claim.ClaimSources,
		Description:     claim.Description,
		ClaimantID:      claim.ClaimantID,
		RatingID:        claim.RatingID,
		Review:          claim.Review,
		ReviewTagLine:   claim.ReviewTagLine,
		ReviewSources:   claim.ReviewSources,
		LastUpdatedByID: claim.LastUpdatedByID,
		CreatedByID:     claim.CreatedByID,
		MetaFields:      claim.MetaFields,
		SpaceID:         claim.SpaceID,
	}

	err := config.DB.Model(&model.Claim{}).Create(&result).Error

	if err != nil {
		log.Fatal(err)
	}

	config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Claimant").Preload("Rating.Medium").Preload("Claimant.Medium").Find(&result)

	render.JSON(w, http.StatusCreated, result)
}
