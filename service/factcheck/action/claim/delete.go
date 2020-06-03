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

// delete - Delete claim by id
// @Summary Delete a claim
// @Description Delete claim by ID
// @Tags Claim
// @ID delete-claim-by-id
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param claim_id path string true "Claim ID"
// @Success 200
// @Router /{space_id}/factcheck/claims/{claim_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	claimID := chi.URLParam(r, "claim_id")
	id, err := strconv.Atoi(claimID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	result := &model.Claim{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Claim{
		SpaceID: uint(sid),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	config.DB.Delete(&result)

	render.JSON(w, http.StatusOK, nil)
}
