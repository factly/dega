package category

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/errors"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get category by id
// @Summary Show a category by id
// @Description Get category by ID
// @Tags Category
// @ID get-category-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param category_id path string true "Category ID"
// @Success 200 {object} model.Category
// @Router /core/categories/{category_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errors.Parser(w, errors.InternalServerError, 500)
		return
	}

	categoryID := chi.URLParam(r, "category_id")
	id, err := strconv.Atoi(categoryID)

	if err != nil {
		errors.Parser(w, errors.InvalidID, 404)
		return
	}

	result := &model.Category{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Category{}).Preload("Medium").Where(&model.Category{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		errors.Parser(w, err.Error(), 404)
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
