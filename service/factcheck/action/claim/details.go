package claim

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/errors"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get claim by id
// @Summary Show a claim by id
// @Description Get claim by ID
// @Tags Claim
// @ID get-claim-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param claim_id path string true "Claim ID"
// @Success 200 {object} model.Claim
// @Router /factcheck/claims/{claim_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errors.Parser(w, r, errors.InternalServerError, 500)
		return
	}

	claimID := chi.URLParam(r, "claim_id")
	id, err := strconv.Atoi(claimID)

	if err != nil {
		errors.Parser(w, r, errors.InvalidID, 404)
		return
	}

	result := &model.Claim{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Claimant").Preload("Rating.Medium").Preload("Claimant.Medium").Where(&model.Claim{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		errors.Parser(w, r, err.Error(), 404)
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
