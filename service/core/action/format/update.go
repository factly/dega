package format

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

// update - Update format by id
// @Summary Update a format by id
// @Description Update format by ID
// @Tags Format
// @ID update-format-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param format_id path string true "Format ID"
// @Param X-Space header string true "Space ID"
// @Param Format body format false "Format"
// @Success 200 {object} model.Format
// @Router /core/formats/{format_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	formatID := chi.URLParam(r, "format_id")
	id, err := strconv.Atoi(formatID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Format{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Format{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	format := &format{}
	err = json.NewDecoder(r.Body).Decode(&format)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(format)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	var formatSlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Format{})
	tableName := stmt.Schema.Table

	if result.Slug == format.Slug {
		formatSlug = result.Slug
	} else if format.Slug != "" && slug.Check(format.Slug) {
		formatSlug = slug.Approve(format.Slug, sID, tableName)
	} else {
		formatSlug = slug.Approve(slug.Make(format.Name), sID, tableName)
	}

	// Check if format with same name exist
	if format.Name != result.Name && util.CheckName(uint(sID), format.Name, tableName) {
		loggerx.Error(errors.New(`format with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	tx := config.DB.Begin()
	tx.Model(&result).Updates(model.Format{
		Name:        format.Name,
		Slug:        formatSlug,
		Description: format.Description,
	}).First(&result)

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":          result.ID,
		"kind":        "format",
		"name":        result.Name,
		"slug":        result.Slug,
		"description": result.Description,
		"space_id":    result.SpaceID,
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
