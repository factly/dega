package medium

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

func list(w http.ResponseWriter, r *http.Request) {

	var media []model.Medium

	err := config.DB.Model(&model.Medium{}).Find(&media).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, media)
}
