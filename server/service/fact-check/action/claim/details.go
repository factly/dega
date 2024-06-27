package claim

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
// @Route /fact-check/claims/{claim_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
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

	claimService := service.GetClaimService()

	result, serviceErr := claimService.GetById(sID, id)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
