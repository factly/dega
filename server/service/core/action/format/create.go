package format

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"gorm.io/gorm"
)

// create - Create format
// @Summary Create format
// @Description Create format
// @Tags Format
// @ID add-format
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Format body format true "Format Object"
// @Success 201 {object} model.Format
// @Failure 400 {array} string
// @Router /core/formats [post]
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
	if format.Slug != "" && util.CheckSlug(format.Slug) {
		formatSlug = format.Slug
	} else {
		formatSlug = util.MakeSlug(format.Name)
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Format{})
	tableName := stmt.Schema.Table

	// Check if format with same name exist
	if util.CheckName(sID, format.Name, tableName) {
		loggerx.Error(errors.New(`format with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	mediumID := &format.MediumID

	result := &model.Format{
		Base: config.Base{
			CreatedAt: format.CreatedAt,
			UpdatedAt: format.UpdatedAt,
		},
		Name:        format.Name,
		Description: format.Description,
		Slug:        util.ApproveSlug(formatSlug, sID, tableName),
		MetaFields:  format.MetaFields,
		Meta:        format.Meta,
		HeaderCode:  format.HeaderCode,
		FooterCode:  format.FooterCode,
		SpaceID:     sID,
		MediumID:    mediumID,
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	err = tx.Model(&model.Format{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Format{}).Preload("Medium").First(&result)

	if config.SearchEnabled() {
		_ = insertIntoMeili(*result)
	}

	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("format.created", sID.String(), r) {
			if err = util.NC.Publish("format.created", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusCreated, result)
}

func insertIntoMeili(format model.Format) error {
	meiliObj := map[string]interface{}{
		"id":          format.ID.String(),
		"kind":        "format",
		"name":        format.Name,
		"slug":        format.Slug,
		"description": format.Description,
		"space_id":    format.SpaceID,
	}

	return meilisearch.AddDocument("dega", meiliObj)
}
