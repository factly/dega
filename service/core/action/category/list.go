package category

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

func list(w http.ResponseWriter, r *http.Request) {

	data := []model.Category{}

	err := config.DB.Model(&model.Category{}).Preload("Medium").Find(&data).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, data)
}
