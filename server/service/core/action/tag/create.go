package tag

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

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
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// create - Create tag
// @Summary Create tag
// @Description Create tag
// @Tags Tag
// @ID add-tag
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Tag body tag true "Tag Object"
// @Success 201 {object} model.Tag
// @Failure 400 {array} string
// @Router /core/tags [post]
func create(w http.ResponseWriter, r *http.Request) {

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

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Tag{})
	tableName := stmt.Schema.Table

	var tagSlug string
	if tag.Slug != "" && slugx.Check(tag.Slug) {
		tagSlug = tag.Slug
	} else {
		tagSlug = slugx.Make(tag.Name)
	}

	// Check if tag with same name exist
	if util.CheckName(uint(sID), tag.Name, tableName) {
		loggerx.Error(errors.New(`tag with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

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

	mediumID := &tag.MediumID
	if tag.MediumID == 0 {
		mediumID = nil
	}

	result := &model.Tag{
		Name:             tag.Name,
		Slug:             slugx.Approve(&config.DB, tagSlug, sID, tableName),
		BackgroundColour: tag.BackgroundColour,
		Description:      jsonDescription,
		HTMLDescription:  htmlDescription,
		SpaceID:          uint(sID),
		MediumID:         mediumID,
		IsFeatured:       tag.IsFeatured,
		MetaFields:       tag.MetaFields,
		Meta:             tag.Meta,
		HeaderCode:       tag.HeaderCode,
		FooterCode:       tag.FooterCode,
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	err = tx.Model(&model.Tag{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Tag{}).Preload("Medium").First(&result)

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":                result.ID,
		"kind":              "tag",
		"name":              result.Name,
		"slug":              result.Slug,
		"background_colour": result.BackgroundColour,
		"description":       result.Description,
		"space_id":          result.SpaceID,
	}

	if config.SearchEnabled() {
		_ = meilisearchx.AddDocument("dega", meiliObj)
	}
	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("tag.created", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusCreated, result)
}
