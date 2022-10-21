package format

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
	} else if format.Slug != "" && slugx.Check(format.Slug) {
		formatSlug = slugx.Approve(&config.DB, format.Slug, sID, tableName)
	} else {
		formatSlug = slugx.Approve(&config.DB, slugx.Make(format.Name), sID, tableName)
	}

	// Check if format with same name exist
	if format.Name != result.Name && util.CheckName(uint(sID), format.Name, tableName) {
		loggerx.Error(errors.New(`format with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	tx := config.DB.Begin()

	updateMap := map[string]interface{}{
		"created_at":    format.CreatedAt,
		"updated_at":    format.UpdatedAt,
		"updated_by_id": uint(uID),
		"name":          format.Name,
		"slug":          formatSlug,
		"description":   format.Description,
		"meta_fields":   format.MetaFields,
		"meta":          format.Meta,
		"header_code":   format.HeaderCode,
		"footer_code":   format.FooterCode,
		"medium_id":     format.MediumID,
	}

	if format.MediumID == 0 {
		updateMap["medium_id"] = nil
	}

	if format.CreatedAt.IsZero() {
		updateMap["created_at"] = result.CreatedAt
	}

	if format.UpdatedAt.IsZero() {
		updateMap["updated_at"] = time.Now()
	}

	tx.Model(&result).Updates(&updateMap).Preload("Medium").First(&result)

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":          result.ID,
		"kind":        "format",
		"name":        result.Name,
		"slug":        result.Slug,
		"description": result.Description,
		"space_id":    result.SpaceID,
	}

	if config.SearchEnabled() {
		err = searchService.GetSearchService().Update(meiliObj)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("format.updated", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("format.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, result)
}
