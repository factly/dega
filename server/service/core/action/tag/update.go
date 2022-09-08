package tag

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// update - Update tag by id
// @Summary Update a tag by id
// @Description Update tag by ID
// @Tags Tag
// @ID update-tag-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param tag_id path string true "Tag ID"
// @Param X-Space header string true "Space ID"
// @Param Tag body tag false "Tag"
// @Success 200 {object} model.Tag
// @Router /core/tags/{tag_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	tagID := chi.URLParam(r, "tag_id")
	id, err := strconv.Atoi(tagID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

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

	result := &model.Tag{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Tag{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tag := &tag{}
	err = json.NewDecoder(r.Body).Decode(&tag)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(tag)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	var tagSlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Tag{})
	tableName := stmt.Schema.Table

	if result.Slug == tag.Slug {
		tagSlug = result.Slug
	} else if tag.Slug != "" && slugx.Check(tag.Slug) {
		tagSlug = slugx.Approve(&config.DB, tag.Slug, sID, tableName)
	} else {
		tagSlug = slugx.Approve(&config.DB, slugx.Make(tag.Name), sID, tableName)
	}

	// Check if tag with same name exist
	if tag.Name != result.Name && util.CheckName(uint(sID), tag.Name, tableName) {
		loggerx.Error(errors.New(`tag with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	// Store HTML description
	var htmlDescription string
	var jsonDescription postgres.Jsonb
	if len(tag.Description.RawMessage) > 0 {
		htmlDescription, err = util.GetHTMLDescription(tag.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		jsonDescription, err = util.GetJSONDescription(tag.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
	}

	tx := config.DB.Begin()

	updateMap := map[string]interface{}{
		"created_at":       tag.CreatedAt,
		"updated_at":       tag.UpdatedAt,
		"updated_by_id":    uint(uID),
		"name":             tag.Name,
		"slug":             tagSlug,
		"description":      jsonDescription,
		"html_description": htmlDescription,
		"meta_fields":      tag.MetaFields,
		"meta":             tag.Meta,
		"header_code":      tag.HeaderCode,
		"footer_code":      tag.FooterCode,
		"medium_id":        tag.MediumID,
		"is_featured":      tag.IsFeatured,
		"background_colour": tag.BackgroundColour,
	}
	result.MediumID = &tag.MediumID
	if tag.MediumID == 0 {
		updateMap["medium_id"] = nil
	}

	if tag.CreatedAt.IsZero() {
		updateMap["created_at"] = result.CreatedAt
	}

	if tag.UpdatedAt.IsZero() {
		updateMap["updated_at"] = time.Now()
	}

	tx.Model(&result).Select("IsFeatured").Updates(model.Tag{IsFeatured: tag.IsFeatured})
	err = tx.Model(&result).Updates(&updateMap).Preload("Medium").First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":                result.ID,
		"kind":              "tag",
		"name":              result.Name,
		"slug":              result.Slug,
		"description":       result.Description,
		"background_colour": result.BackgroundColour,
		"space_id":          result.SpaceID,
	}

	if config.SearchEnabled() {
		_ = meilisearchx.UpdateDocument("dega", meiliObj)
	}
	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("tag.updated", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
