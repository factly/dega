package claim

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/dega-server/validation"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// update - Update claim by id
// @Summary Update a claim by id
// @Description Update claim by ID
// @Tags Claim
// @ID update-claim-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param claim_id path string true "Claim ID"
// @Param Claim body claim false "Claim"
// @Success 200 {object} model.Claim
// @Router /factcheck/claims/{claim_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		return
	}

	claimID := chi.URLParam(r, "claim_id")
	id, err := strconv.Atoi(claimID)

	if err != nil {
		return
	}

	claim := &claim{}
	json.NewDecoder(r.Body).Decode(&claim)

	result := &model.Claim{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Claimant{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	var claimSlug string

	if result.Slug == claim.Slug {
		claimSlug = result.Slug
	} else if claim.Slug != "" && slug.Check(claim.Slug) {
		claimSlug = slug.Approve(claim.Slug, sID, config.DB.NewScope(&model.Claim{}).TableName())
	} else {
		claimSlug = slug.Approve(slug.Make(claim.Title), sID, config.DB.NewScope(&model.Claim{}).TableName())
	}

	config.DB.Model(&result).Updates(model.Claim{
		Title:         claim.Title,
		Slug:          claimSlug,
		ClaimDate:     claim.ClaimDate,
		CheckedDate:   claim.CheckedDate,
		ClaimSources:  claim.ClaimSources,
		Description:   claim.Description,
		ClaimantID:    claim.ClaimantID,
		RatingID:      claim.RatingID,
		Review:        claim.Review,
		ReviewTagLine: claim.ReviewTagLine,
		ReviewSources: claim.ReviewSources,
	}).Preload("Rating").Preload("Claimant").Preload("Rating.Medium").Preload("Claimant.Medium").First(&result)

	renderx.JSON(w, http.StatusOK, result)
}
