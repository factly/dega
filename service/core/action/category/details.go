package category

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
	"github.com/go-chi/chi"
)

// details - Get category by id
// @Summary Show a category by id
// @Description Get category by ID
// @Tags Category
// @ID get-category-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param category_id path string true "Category ID"
// @Success 200 {object} model.Category
// @Router /{space_id}/core/categories/{category_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	categoryID := chi.URLParam(r, "category_id")
	id, err := strconv.Atoi(categoryID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	if err != nil {
		validation.InvalidID(w, r)
		return
	}

	result := &model.Category{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Category{}).Preload("Medium").Where(&model.Category{
		SpaceID: uint(sid),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	render.JSON(w, http.StatusOK, result)
}
