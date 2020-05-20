package category

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// delete - Delete category by id
// @Summary Delete a category
// @Description Delete category by ID
// @Tags Category
// @ID delete-category-by-id
// @Param X-User header string true "User ID"
// @Param category_id path string true "Category ID"
// @Success 200
// @Failure 400 {array} string
// @Router /core/categories/{category_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	categoryID := chi.URLParam(r, "category_id")
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
