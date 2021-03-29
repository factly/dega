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
	"github.com/factly/x/editorx"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
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

	// Store HTML description
	editorjsBlocks := make(map[string]interface{})
	err = json.Unmarshal(podcast.Description.RawMessage, &editorjsBlocks)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	description, err := editorx.EditorjsToHTML(editorjsBlocks)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse podcast description", http.StatusUnprocessableEntity)))
		return
	}

	result := &model.Podcast{
		Title:           podcast.Title,
		Description:     podcast.Description,
		HTMLDescription: description,
		Slug:            slugx.Approve(&config.DB, podcastSlug, sID, tableName),
		Language:        podcast.Language,
		MediumID:        mediumID,
		SpaceID:         uint(sID),
	}

	if len(podcast.EpisodeIDs) > 0 {
		config.DB.Model(&model.Episode{}).Where(podcast.EpisodeIDs).Find(&result.Episodes)
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

	tx.Model(&model.Podcast{}).Preload("Medium").Preload("Episodes").Preload("Categories").First(&result)

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":                  result.ID,
		"kind":                "podcast",
		"title":               result.Title,
		"slug":                result.Slug,
		"description":         result.Description,
		"language":            result.Language,
		"episode_ids":         podcast.EpisodeIDs,
		"category_ids":        podcast.CategoryIDs,
		"space_id":            result.SpaceID,
		"primary_category_id": result.PrimaryCategoryID,
		"medium_id":           result.MediumID,
	}

	err = meilisearchx.AddDocument("dega", meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
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
