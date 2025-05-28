package claim

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

// delete - Delete claim by id
// @Summary Delete a claim
// @Description Delete claim by ID
// @Tags Claim
// @ID delete-claim-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param claim_id path string true "Claim ID"
// @Success 200
// @Router /fact-check/claims/{claim_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	claimID := chi.URLParam(r, "claim_id")
	id, err := uuid.Parse(claimID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	claimantService := service.GetClaimService()

	result, serviceErr := claimantService.GetById(authCtx.SpaceID, id)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	serviceErr = claimantService.Delete(authCtx.SpaceID, id)

	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	if config.SearchEnabled() {
		_ = meilisearch.DeleteDocument(meiliIndex, result.ID.String())
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("claim.deleted", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("claim.deleted", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, nil)
}
