package category

import (
	"encoding/json"
	"net/http"

	"github.com/factly/x/loggerx"
	"github.com/google/uuid"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
)

// create - Create category
// @Summary Create category
// @Description Create category
// @Tags Category
// @ID add-category
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Category body category true "Category Object"
// @Success 201 {object} model.Category
// @Failure 400 {array} string
// @Router /core/categories [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	category := &service.Category{}

	err = json.NewDecoder(r.Body).Decode(category)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	categoryService := service.GetCategoryService()

	if category.ParentID != uuid.Nil {
		// Check if parent category exist or not
		_, err = categoryService.GetById(sID, category.ParentID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("Parent category does not exist", http.StatusUnprocessableEntity)))
			return
		}
	}

	result, serviceErr := categoryService.Create(r.Context(), sID, uID, category)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":                result.ID.String(),
		"kind":              "category",
		"name":              result.Name,
		"slug":              result.Slug,
		"background_colour": result.BackgroundColour,
		"description":       result.Description,
		"space_id":          result.SpaceID,
		"meta_fields":       result.MetaFields,
	}

	if config.SearchEnabled() {
		_ = meilisearch.AddDocument("dega", meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("category.created", sID.String(), r) {
			if err = util.NC.Publish("category.created", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusCreated, result)
}
