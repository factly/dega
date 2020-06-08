package category

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
	"github.com/go-chi/chi"
)

// delete - Delete category by id
// @Summary Delete a category
// @Description Delete category by ID
// @Tags Category
// @ID delete-category-by-id
// @Param X-User header string true "User ID"
// @Param category_id path string true "Category ID"
// @Param X-Space header string true "Space ID"
// @Success 200
// @Failure 400 {array} string
// @Router /core/categories/{category_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	categoryID := chi.URLParam(r, "category_id")
	id, err := strconv.Atoi(categoryID)

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		return
	}

	if err != nil {
		validation.InvalidID(w, r)
		return
	}

	result := &model.Category{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Category{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	config.DB.Delete(&result)

	render.JSON(w, http.StatusOK, nil)
}
