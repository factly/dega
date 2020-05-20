package claim

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
)

// list - Get all claims
// @Summary Show all claims
// @Description Get all claims
// @Tags Claim
// @ID get-all-claims
// @Produce  json
// @Param X-User header string true "User ID"
// @Success 200 {array} model.Claim
// @Router /factcheck/claims [get]
func list(w http.ResponseWriter, r *http.Request) {

	result := []model.Claim{}

	err := config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Claimant").Preload("Rating.Medium").Preload("Claimant.Medium").Find(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
