package format

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meili"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
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

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	oID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
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
	if format.Slug != "" && slug.Check(format.Slug) {
		formatSlug = format.Slug
	} else {
		formatSlug = slug.Make(format.Name)
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Format{})
	tableName := stmt.Schema.Table

	if formatSlug == "fact-check" && viper.GetBool("create_super_organisation") {
		permission := model.OrganisationPermission{}
		err = config.DB.Model(&model.OrganisationPermission{}).Where(&model.OrganisationPermission{
			OrganisationID: uint(oID),
		}).First(&permission).Error

		if err != nil || !permission.FactCheck {
			loggerx.Error(errors.New(`does not have permission to create fact-check`))
			errorx.Render(w, errorx.Parser(errorx.Message{
				Code:    http.StatusUnprocessableEntity,
				Message: "does not have permission to create fact-check",
			}))
			return
		}
	}

	// Check if format with same name exist
	if util.CheckName(uint(sID), format.Name, tableName) {
		loggerx.Error(errors.New(`format with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	result := &model.Format{
		Name:        format.Name,
		Description: format.Description,
		Slug:        slug.Approve(formatSlug, sID, tableName),
		SpaceID:     uint(sID),
	}

	tx := config.DB.Begin()
	err = tx.Model(&model.Format{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	err = insertIntoMeili(*result)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
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

	return meili.AddDocument(meiliObj)
}
