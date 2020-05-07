package category

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

func details(w http.ResponseWriter, r *http.Request) {

	categoryID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(categoryID)

	if err != nil {
		return
	}

	category := &model.Category{}

	category.ID = uint(id)

	err = config.DB.Model(&model.Category{}).Preload("Medium").First(&category).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, category)
}
