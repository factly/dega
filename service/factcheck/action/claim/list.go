package claim

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
)

func list(w http.ResponseWriter, r *http.Request) {

	result := []model.Claim{}

	err := config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Claimant").Preload("Rating.Medium").Preload("Claimant.Medium").Find(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
