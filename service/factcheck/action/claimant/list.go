package claimant

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
)

func list(w http.ResponseWriter, r *http.Request) {

	var claimants []model.Claimant

	err := config.DB.Model(&model.Claimant{}).Preload("Medium").Find(&claimants).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, claimants)
}
