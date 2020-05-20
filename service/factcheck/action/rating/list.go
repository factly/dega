package rating

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
)

func list(w http.ResponseWriter, r *http.Request) {

	var ratings []model.Rating

	err := config.DB.Model(&model.Rating{}).Preload("Medium").Find(&ratings).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, ratings)
}
