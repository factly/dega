package claimant

import (
	"net/http"

	"github.com/factly/dega-server/service/fact-check/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

// delete - Delete claimant by id
// @Summary Delete a claimant
// @Description Delete claimant by ID
// @Tags Claimant
// @ID delete-claimant-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param claimant_id path string true "Claimant ID"
// @Success 200
// @Router /fact-check/claimants/{claimant_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	claimantID := chi.URLParam(r, "claimant_id")
	id, err := uuid.Parse(claimantID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	claimantService := service.GetClaimantService()

	// check record exists or not
	result, err := claimantService.GetById(authCtx.SpaceID, id)
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	serviceErr := claimantService.Delete(authCtx.SpaceID, id)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	// if config.SearchEnabled() {
	// 	_ = meilisearch.DeleteDocument(meiliIndex, result.ID, "claimant")
	// }

	if util.CheckNats() {
		if util.CheckWebhookEvent("claimant.deleted", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("claimant.deleted", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusOK, nil)
}
