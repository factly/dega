package category

import (
	"net/http"

	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
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
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	categoryID := chi.URLParam(r, "category_id")
	id, err := uuid.Parse(categoryID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	categoryService := service.GetCategoryService()

	result, err := categoryService.GetById(sID, id)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	renderx.JSON(w, http.StatusOK, result)
}
