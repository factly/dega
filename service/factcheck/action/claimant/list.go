package claimant

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
)

// list - Get all claimants
// @Summary Show all claimants
// @Description Get all claimants
// @Tags Claimant
// @ID get-all-claimants
// @Produce  json
// @Param X-User header string true "User ID"
// @Success 200 {array} model.Claimant
// @Router /factcheck/claimants [get]
func list(w http.ResponseWriter, r *http.Request) {

	var claimants []model.Claimant

	err := config.DB.Model(&model.Claimant{}).Preload("Medium").Find(&claimants).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, claimants)
}
