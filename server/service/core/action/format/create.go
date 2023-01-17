package format

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

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
	"github.com/spf13/viper"
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
	if format.Slug != "" && slugx.Check(format.Slug) {
		formatSlug = format.Slug
	} else {
		formatSlug = slugx.Make(format.Name)
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Format{})
	tableName := stmt.Schema.Table

	if formatSlug == "fact-check" && viper.GetBool("create_super_organisation") {
		permission := model.SpacePermission{}
		err = config.DB.Model(&model.SpacePermission{}).Where(&model.SpacePermission{
			SpaceID: uint(sID),
		}).First(&permission).Error

		if err != nil || !permission.FactCheck {
			loggerx.Error(errors.New(`does not have permission to create fact-check`))
			errorx.Render(w, errorx.Parser(errorx.GetMessage(`does not have permission to create fact-check`, http.StatusUnprocessableEntity)))
			return
		}
	}

	// Check if format with same name exist
	if util.CheckName(uint(sID), format.Name, tableName) {
		loggerx.Error(errors.New(`format with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	mediumID := &format.MediumID
	if format.MediumID == 0 {
		mediumID = nil
	}

	result := &model.Format{
		Base: config.Base{
			CreatedAt: format.CreatedAt,
			UpdatedAt: format.UpdatedAt,
		},
		Name:        format.Name,
		Description: format.Description,
		Slug:        slugx.Approve(&config.DB, formatSlug, sID, tableName),
		MetaFields:  format.MetaFields,
		Meta:        format.Meta,
		HeaderCode:  format.HeaderCode,
		FooterCode:  format.FooterCode,
		SpaceID:     uint(sID),
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
		if util.CheckWebhookEvent("format.created", strconv.Itoa(sID), r) {
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
		"id":          format.ID,
		"kind":        "format",
		"name":        format.Name,
		"slug":        format.Slug,
		"description": format.Description,
		"space_id":    format.SpaceID,
	}

	return meilisearchx.AddDocument("dega", meiliObj)
}
