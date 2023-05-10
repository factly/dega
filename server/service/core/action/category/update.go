package category

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

// update - Update category by id
// @Summary Update a category by id
// @Description Update category by ID
// @Tags Category
// @ID update-category-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param category_id path string true "Category ID"
// @Param X-Space header string true "Space ID"
// @Param Category body category false "Category"
// @Success 200 {object} model.Category
// @Router /core/categories/{category_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	categoryID := chi.URLParam(r, "category_id")
	id, err := strconv.Atoi(categoryID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return

	}

	category := &service.Category{}
	err = json.NewDecoder(r.Body).Decode(&category)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(category)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}
	// check record exists or not
	categoryService := service.GetCategoryService()
	_, err = categoryService.GetById(sID, int(id))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	// Check if parent category exist or not
	_, err = categoryService.GetById(sID, int(category.ParentID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage("Parent category does not exist", http.StatusUnprocessableEntity)))
		return
	}
	result, serviceErr := categoryService.Update(sID, uID, id, category)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":                result.ID,
		"kind":              "category",
		"name":              result.Name,
		"slug":              result.Slug,
		"description":       result.Description,
		"background_colour": result.BackgroundColour,
		"space_id":          result.SpaceID,
		"meta_fields":       result.MetaFields,
	}

	if config.SearchEnabled() {
		_ = meilisearchx.UpdateDocument("dega", meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("category.updated", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("category.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, result)
}
