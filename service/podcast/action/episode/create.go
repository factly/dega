package episode

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"reflect"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/util"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"gorm.io/gorm"
)

// create - Create episode
// @Summary Create episode
// @Description Create episode
// @Tags Episode
// @ID add-episode
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Episode body episode true "Episode Object"
// @Success 201 {object} model.Episode
// @Failure 400 {array} string
// @Router /podcast/episodes [post]
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

	episode := &episode{}

	err = json.NewDecoder(r.Body).Decode(&episode)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(episode)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	var episodeSlug string
	if episode.Slug != "" && slugx.Check(episode.Slug) {
		episodeSlug = episode.Slug
	} else {
		episodeSlug = slugx.Make(episode.Title)
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Episode{})
	tableName := stmt.Schema.Table

	// Check if episode with same name exist
	if util.CheckName(uint(sID), episode.Title, tableName) {
		loggerx.Error(errors.New(`episode with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	mediumID := &episode.MediumID
	if episode.MediumID == 0 {
		mediumID = nil
	}

	// Store HTML description
	var description string
	if len(episode.Description.RawMessage) > 0 && !reflect.DeepEqual(episode.Description, test.NilJsonb()) {
		description, err = util.HTMLDescription(episode.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse episode description", http.StatusUnprocessableEntity)))
			return
		}
	}

	result := &model.Episode{
		Title:           episode.Title,
		Description:     episode.Description,
		HTMLDescription: description,
		Slug:            slugx.Approve(&config.DB, episodeSlug, sID, tableName),
		Season:          episode.Season,
		Episode:         episode.Episode,
		AudioURL:        episode.AudioURL,
		PublishedDate:   episode.PublishedDate,
		MediumID:        mediumID,
		SpaceID:         uint(sID),
	}
	tx := config.DB.WithContext(context.WithValue(r.Context(), episodeUser, uID)).Begin()
	err = tx.Model(&model.Episode{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Episode{}).Preload("Medium").First(&result)

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":             result.ID,
		"kind":           "episode",
		"title":          result.Title,
		"slug":           result.Slug,
		"season":         result.Season,
		"episode":        result.Episode,
		"audio_url":      result.AudioURL,
		"description":    result.Description,
		"published_date": result.PublishedDate,
		"space_id":       result.SpaceID,
		"medium_id":      result.MediumID,
	}

	err = meilisearchx.AddDocument("dega", meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	if err = util.NC.Publish("episode.created", result); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	renderx.JSON(w, http.StatusCreated, result)
}
