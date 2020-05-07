package category

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

func delete(w http.ResponseWriter, r *http.Request) {

	categoryID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(categoryID)

	category := &model.Category{}

	category.ID = uint(id)

	// check record exists or not
	err = config.DB.First(&category).Error

	if err != nil {
		return
	}

	config.DB.Delete(&category)

	render.JSON(w, http.StatusOK, nil)
}
