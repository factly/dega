package claim

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
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
// @Router /fact-check/claims/{claim_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	claimID := chi.URLParam(r, "claim_id")
	id, err := strconv.Atoi(claimID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	claim := &service.Claim{}
	err = json.NewDecoder(r.Body).Decode(&claim)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	claimService := service.GetClaimService()
	result, serviceErr := claimService.Update(sID, uID, id, claim)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	var claimMeiliDate int64 = 0
	if result.ClaimDate != nil {
		claimMeiliDate = result.ClaimDate.Unix()
	}
	var checkedMeiliDate int64 = 0
	if result.CheckedDate != nil {
		checkedMeiliDate = result.CheckedDate.Unix()
	}
	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":             result.ID,
		"kind":           "claim",
		"claim":          result.Claim,
		"slug":           result.Slug,
		"description":    result.Description,
		"claim_date":     claimMeiliDate,
		"checked_date":   checkedMeiliDate,
		"claim_sources":  result.ClaimSources,
		"claimant_id":    result.ClaimantID,
		"rating_id":      result.RatingID,
		"fact":           result.Fact,
		"review_sources": result.ReviewSources,
		"space_id":       result.SpaceID,
	}

	if config.SearchEnabled() {
		_ = meilisearchx.UpdateDocument("dega", meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("claim.updated", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("claim.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, result)
}
