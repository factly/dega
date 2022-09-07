package podcast

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/podcast/model"
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

// create - Create podcast
// @Summary Create podcast
// @Description Create podcast
// @Tags Podcast
// @ID add-podcast
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Podcast body podcast true "Podcast Object"
// @Success 201 {object} model.Podcast
// @Failure 400 {array} string
// @Router /podcast [post]
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

	podcast := &podcast{}

	err = json.NewDecoder(r.Body).Decode(&podcast)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(podcast)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	var podcastSlug string
	if podcast.Slug != "" && slugx.Check(podcast.Slug) {
		podcastSlug = podcast.Slug
	} else {
		podcastSlug = slugx.Make(podcast.Title)
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Podcast{})
	tableName := stmt.Schema.Table

	// Check if podcast with same name exist
	if util.CheckName(uint(sID), podcast.Title, tableName) {
		loggerx.Error(errors.New(`podcast with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	mediumID := &podcast.MediumID
	if podcast.MediumID == 0 {
		mediumID = nil
	}

	primaryCategoryID := &podcast.PrimaryCategoryID
	if podcast.PrimaryCategoryID == 0 {
		primaryCategoryID = nil
	}

	// Store HTML description
	var htmlDescription string
	var jsonDescription postgres.Jsonb
	if len(podcast.Description.RawMessage) > 0 {
		htmlDescription, err = util.GetHTMLDescription(podcast.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		jsonDescription, err = util.GetJSONDescription(podcast.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
	}

	result := &model.Podcast{
		Base: config.Base{
			CreatedAt: podcast.CreatedAt,
			UpdatedAt: podcast.UpdatedAt,
		},
		Title:             podcast.Title,
		Description:       jsonDescription,
		HTMLDescription:   htmlDescription,
		Slug:              slugx.Approve(&config.DB, podcastSlug, sID, tableName),
		Language:          podcast.Language,
		MediumID:          mediumID,
		PrimaryCategoryID: primaryCategoryID,
		HeaderCode:        podcast.HeaderCode,
		FooterCode:        podcast.FooterCode,
		MetaFields:        podcast.MetaFields,
		SpaceID:           uint(sID),
	}

	if len(podcast.CategoryIDs) > 0 {
		config.DB.Model(&coreModel.Category{}).Where(podcast.CategoryIDs).Find(&result.Categories)
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), podcastUser, uID)).Begin()
	err = tx.Model(&model.Podcast{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Podcast{}).Preload("Medium").Preload("Categories").Preload("PrimaryCategory").First(&result)

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":                  result.ID,
		"kind":                "podcast",
		"title":               result.Title,
		"slug":                result.Slug,
		"description":         result.Description,
		"language":            result.Language,
		"category_ids":        podcast.CategoryIDs,
		"space_id":            result.SpaceID,
		"primary_category_id": result.PrimaryCategoryID,
		"medium_id":           result.MediumID,
	}

	if config.SearchEnabled() {
		_ = meilisearchx.AddDocument("dega", meiliObj)
	}

	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("podcast.created", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}
	renderx.JSON(w, http.StatusCreated, result)
}
