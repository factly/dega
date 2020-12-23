package category

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meili"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
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
	} else if category.Slug != "" && slug.Check(category.Slug) {
		categorySlug = slug.Approve(category.Slug, sID, tableName)
	} else {
		categorySlug = slug.Approve(slug.Make(category.Name), sID, tableName)
	}

	// Check if category with same name exist
	if category.Name != result.Name && util.CheckName(uint(sID), category.Name, tableName) {
		loggerx.Error(errors.New(`category with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	tx := config.DB.Begin()

	mediumID := &category.MediumID
	result.MediumID = &category.MediumID
	if category.MediumID == 0 {
		err = tx.Model(&result).Updates(map[string]interface{}{"medium_id": nil}).Error
		mediumID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	parentID := &category.ParentID
	if category.ParentID == 0 {
		err = tx.Model(&result).Updates(map[string]interface{}{"parent_id": nil}).Error
		parentID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	tx.Model(&result).Select("IsFeatured").Updates(model.Category{IsFeatured: category.IsFeatured})
	err = tx.Model(&result).Updates(model.Category{
		Base:        config.Base{UpdatedByID: uint(uID)},
		Name:        category.Name,
		Slug:        categorySlug,
		Description: category.Description,
		ParentID:    parentID,
		MediumID:    mediumID,
		MetaFields:  category.MetaFields,
	}).Preload("Medium").First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":          result.ID,
		"kind":        "category",
		"name":        result.Name,
		"slug":        result.Slug,
		"description": result.Description,
		"space_id":    result.SpaceID,
		"meta_fields": result.MetaFields,
	}

	err = meili.UpdateDocument(meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, result)
}
