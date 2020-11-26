package medium

import (
	"context"
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

// create - Create medium
// @Summary Create medium
// @Description Create medium
// @Tags Medium
// @ID add-medium
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Medium body []medium true "Medium Object"
// @Success 201 {object} []model.Medium
// @Failure 400 {array} string
// @Router /core/media [post]
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

	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	var mediumList []medium

	err = json.NewDecoder(r.Body).Decode(&mediumList)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	if viper.GetBool("create_super_organisation") {
		// Fetch organisation permissions
		permission := model.OrganisationPermission{}
		err = config.DB.Model(&model.OrganisationPermission{}).Where(&model.OrganisationPermission{
			OrganisationID: uint(oID),
		}).First(&permission).Error

		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.Message{
				Code:    http.StatusUnprocessableEntity,
				Message: "cannot create more media",
			}))
			return
		}

		// Fetch total number of medium in space
		var totMedia int64
		config.DB.Model(&model.Medium{}).Where(&model.Medium{
			SpaceID: uint(sID),
		}).Count(&totMedia)

		if totMedia+int64(len(mediumList)) > permission.Media && permission.Media > 0 {
			errorx.Render(w, errorx.Parser(errorx.Message{
				Code:    http.StatusUnprocessableEntity,
				Message: "cannot create more media",
			}))
			return
		}
	}

	result := paging{}
	result.Nodes = make([]model.Medium, 0)

	for _, medium := range mediumList {
		validationError := validationx.Check(medium)

		if validationError != nil {
			loggerx.Error(errors.New("validation error"))
			errorx.Render(w, validationError)
			return
		}

		var mediumSlug string
		if medium.Slug != "" && slug.Check(medium.Slug) {
			mediumSlug = medium.Slug
		} else {
			mediumSlug = slug.Make(medium.Name)
		}

		// Get table name
		stmt := &gorm.Statement{DB: config.DB}
		_ = stmt.Parse(&model.Medium{})
		tableName := stmt.Schema.Table

		med := model.Medium{
			Name:        medium.Name,
			Slug:        slug.Approve(mediumSlug, sID, tableName),
			Title:       medium.Title,
			Type:        medium.Type,
			Description: medium.Description,
			Caption:     medium.Caption,
			AltText:     medium.AltText,
			FileSize:    medium.FileSize,
			URL:         medium.URL,
			Dimensions:  medium.Dimensions,
			SpaceID:     uint(sID),
		}

		result.Nodes = append(result.Nodes, med)
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	err = tx.Model(&model.Medium{}).Create(&result.Nodes).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	for i := range result.Nodes {

		// Insert into meili index
		meiliObj := map[string]interface{}{
			"id":          result.Nodes[i].ID,
			"kind":        "medium",
			"name":        result.Nodes[i].Name,
			"slug":        result.Nodes[i].Slug,
			"title":       result.Nodes[i].Title,
			"type":        result.Nodes[i].Type,
			"description": result.Nodes[i].Description,
			"space_id":    result.Nodes[i].SpaceID,
		}

		err = meili.AddDocument(meiliObj)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	result.Total = int64(len(result.Nodes))

	tx.Commit()
	renderx.JSON(w, http.StatusCreated, result)
}
