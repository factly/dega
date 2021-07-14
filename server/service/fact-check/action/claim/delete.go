package claim

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
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

	sID, err := middlewarex.GetSpace(r.Context())
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

	result := &model.Claim{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Claim{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// check if claim is associated with posts
	var totAssociated int64
	config.DB.Model(&model.PostClaim{}).Where(&model.PostClaim{
		ClaimID: uint(id),
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("claim is associated with post"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("claim", "post")))
		return
	}

	tx := config.DB.Begin()
	tx.Delete(&result)

	if config.SearchEnabled() {
		_ = meilisearchx.DeleteDocument("dega", result.ID, "claim")
	}

	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("claim.deleted", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, nil)
}
