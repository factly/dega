package category

import (
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
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
	id, err := uuid.Parse(categoryID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	if categoryID != "" {
		loggerx.Error(errors.New("category id is required"))
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	// check record exists or not
	categoryService := service.GetCategoryService()
	result, err := categoryService.GetById(authCtx.SpaceID, id)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	serviceErr := categoryService.Delete(authCtx.SpaceID, id)
	if serviceErr != nil {
		loggerx.Error(err)
		errorx.Render(w, serviceErr)
		return
	}

	if config.SearchEnabled() {
		_ = meilisearch.DeleteDocument(meiliIndex, result.ID.String())
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("category.deleted", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("category.deleted", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, nil)
}
