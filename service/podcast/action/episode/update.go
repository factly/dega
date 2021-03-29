package episode

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
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
	"github.com/go-chi/chi"
	"gorm.io/gorm"
)

// update - Update episode by id
// @Summary Update a episode by id
// @Description Update episode by ID
// @Tags Episode
// @ID update-episode-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param episode_id path string true "Episode ID"
// @Param X-Space header string true "Space ID"
// @Param Episode body episode false "Episode"
// @Success 200 {object} model.Episode
// @Router /podcast/episodes/{episode_id} [put]
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

	episodeID := chi.URLParam(r, "episode_id")
	id, err := strconv.Atoi(episodeID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Episode{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Episode{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
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

	// Get table title
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Episode{})
	tableName := stmt.Schema.Table

	if result.Slug == episode.Slug {
		episodeSlug = result.Slug
	} else if episode.Slug != "" && slugx.Check(episode.Slug) {
		episodeSlug = slugx.Approve(&config.DB, episode.Slug, sID, tableName)
	} else {
		episodeSlug = slugx.Approve(&config.DB, slugx.Make(episode.Title), sID, tableName)
	}

	// Check if episode with same title exist
	if episode.Title != result.Title && util.CheckName(uint(sID), episode.Title, tableName) {
		loggerx.Error(errors.New(`episode with same title exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	// Store HTML description
	editorjsBlocks := make(map[string]interface{})
	err = json.Unmarshal(episode.Description.RawMessage, &editorjsBlocks)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	description, err := editorx.EditorjsToHTML(editorjsBlocks)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse episode description", http.StatusUnprocessableEntity)))
		return
	}

	tx := config.DB.Begin()
	mediumID := &episode.MediumID
	result.MediumID = &episode.MediumID
	if episode.MediumID == 0 {
		err = tx.Model(&result).Updates(map[string]interface{}{"medium_id": nil}).Error
		mediumID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	tx.Model(&result).Updates(model.Episode{
		Base:            config.Base{UpdatedByID: uint(uID)},
		Title:           episode.Title,
		HTMLDescription: description,
		Description:     episode.Description,
		Slug:            slugx.Approve(&config.DB, episodeSlug, sID, tableName),
		Season:          episode.Season,
		Episode:         episode.Episode,
		AudioURL:        episode.AudioURL,
		PublishedDate:   episode.PublishedDate,
		MediumID:        mediumID,
		SpaceID:         uint(sID),
	}).First(&result)

	// Update into meili index
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

	err = meilisearchx.UpdateDocument("dega", meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	if err = util.NC.Publish("episode.updated", result); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	renderx.JSON(w, http.StatusOK, result)
}
