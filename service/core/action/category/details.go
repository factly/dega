package category

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// details - Get category by id
// @Summary Show a category by id
// @Description Get category by ID
// @Tags Category
// @ID get-category-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param category_id path string true "Category ID"
// @Success 200 {object} model.Category
// @Router /core/categories/{category_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	categoryID := chi.URLParam(r, "category_id")
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
