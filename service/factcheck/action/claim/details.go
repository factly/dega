package claim

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// details - Get claim by id
// @Summary Show a claim by id
// @Description Get claim by ID
// @Tags Claim
// @ID get-claim-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param claim_id path string true "Claim ID"
// @Success 200 {object} model.Claim
// @Router /factcheck/claims/{claim_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	claimID := chi.URLParam(r, "claim_id")
	id, err := strconv.Atoi(claimID)

	if err != nil {
		return
	}

	result := &model.Claim{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Claimant").Preload("Rating.Medium").Preload("Claimant.Medium").First(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
