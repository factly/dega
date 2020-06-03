package claim

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
	"github.com/go-chi/chi"
)

// details - Get claim by id
// @Summary Show a claim by id
// @Description Get claim by ID
// @Tags Claim
// @ID get-claim-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param claim_id path string true "Claim ID"
// @Success 200 {object} model.Claim
// @Router /{space_id}/factcheck/claims/{claim_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	claimID := chi.URLParam(r, "claim_id")
	id, err := strconv.Atoi(claimID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	if err != nil {
		return
	}

	result := &model.Claim{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Claimant").Preload("Rating.Medium").Preload("Claimant.Medium").Where(&model.Claim{
		SpaceID: uint(sid),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	render.JSON(w, http.StatusOK, result)
}
