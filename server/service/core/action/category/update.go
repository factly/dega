package category

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	searchService "github.com/factly/dega-server/util/search-service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
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

	category := &category{}
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

	result := model.Category{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Category{
		Base: config.Base{
			ID: uint(id),
		},
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	if result.ID == category.ParentID {
		loggerx.Error(errors.New("cannot add itself as parent"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	// Check if parent category exist or not
	if category.ParentID != 0 {
		var parentCat model.Category
		parentCat.ID = category.ParentID
		err = config.DB.Where(&model.Category{SpaceID: uint(sID)}).First(&parentCat).Error

		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("Parent category does not exist", http.StatusUnprocessableEntity)))
			return
		}
	}

	var categorySlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Category{})
	tableName := stmt.Schema.Table

	if result.Slug == category.Slug {
		categorySlug = result.Slug
	} else if category.Slug != "" && slugx.Check(category.Slug) {
		categorySlug = slugx.Approve(&config.DB, category.Slug, sID, tableName)
	} else {
		categorySlug = slugx.Approve(&config.DB, slugx.Make(category.Name), sID, tableName)
	}

	// Check if category with same name exist
	if category.Name != result.Name && util.CheckName(uint(sID), category.Name, tableName) {
		loggerx.Error(errors.New(`category with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	// Store HTML description
	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(category.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(category.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		jsonDescription, err = util.GetJSONDescription(category.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
	}

	tx := config.DB.Begin()
	updateMap := map[string]interface{}{
		"created_at":        category.CreatedAt,
		"updated_at":        category.UpdatedAt,
		"updated_by_id":     uID,
		"name":              category.Name,
		"slug":              categorySlug,
		"description":       jsonDescription,
		"description_html":  descriptionHTML,
		"medium_id":         category.MediumID,
		"is_featured":       category.IsFeatured,
		"meta_fields":       category.MetaFields,
		"meta":              category.Meta,
		"parent_id":         category.ParentID,
		"header_code":       category.HeaderCode,
		"footer_code":       category.FooterCode,
		"background_colour": category.BackgroundColour,
	}
	if category.MediumID == 0 {
		updateMap["medium_id"] = nil
	}

	if category.ParentID == 0 {
		updateMap["parent_id"] = nil
	}

	if category.CreatedAt.IsZero() {
		updateMap["created_at"] = result.CreatedAt
	}

	if category.UpdatedAt.IsZero() {
		updateMap["updated_at"] = time.Now()
	}

	err = tx.Model(&result).Updates(&updateMap).Preload("Medium").Preload("ParentCategory").First(&result).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
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
		err = searchService.GetSearchService().Update(meiliObj)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	tx.Commit()

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
