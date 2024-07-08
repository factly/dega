package claim

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/service"
	"github.com/factly/dega-server/util"

	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// create - Create claim
// @Summary Create claim
// @Description Create claim
// @Tags Claim
// @ID add-claim
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Claim body claim true "Claim Object"
// @Success 201 {object} model.Claim
// @Failure 400 {array} string
// @Router /fact-check/claims [post]
func create(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
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
	result, serviceErr := claimService.Create(r.Context(), authCtx.SpaceID, authCtx.UserID, claim)
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
	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":             result.ID.String(),
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
		_ = meilisearch.AddDocument(meiliIndex, meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("claim.created", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("claim.created", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusCreated, result)
}
