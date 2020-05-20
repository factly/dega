package claim

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/go-chi/chi"
)

func update(w http.ResponseWriter, r *http.Request) {
	claimID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(claimID)

	if err != nil {
		return
	}

	claim := &claim{}
	json.NewDecoder(r.Body).Decode(&claim)

	result := &model.Claim{}
	result.ID = uint(id)

	config.DB.Model(&result).Updates(model.Claim{
		Claim:         claim.Claim,
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
	})

	config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Claimant").Preload("Rating.Medium").Preload("Claimant.Medium").First(&result)

	json.NewEncoder(w).Encode(result)
}
