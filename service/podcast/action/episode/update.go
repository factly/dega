package episode

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/arrays"
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
// @Success 200 {object} episodeData
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

	result := &episodeData{}
	result.Episode.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Episode{
		SpaceID: uint(sID),
	}).First(&result.Episode).Error

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

	tx := config.DB.Begin()
	mediumID := &episode.MediumID
	result.MediumID = &episode.MediumID
	if episode.MediumID == 0 {
		err = tx.Model(&result.Episode).Updates(map[string]interface{}{"medium_id": nil}).Error
		mediumID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	tx.Model(&result.Episode).Select("PublishedDate").Updates(model.Episode{PublishedDate: episode.PublishedDate})
	tx.Model(&result.Episode).Updates(model.Episode{
		Base:            config.Base{UpdatedByID: uint(uID)},
		Title:           episode.Title,
		HTMLDescription: description,
		Description:     episode.Description,
		Slug:            slugx.Approve(&config.DB, episodeSlug, sID, tableName),
		Season:          episode.Season,
		Episode:         episode.Episode,
		AudioURL:        episode.AudioURL,
		MediumID:        mediumID,
		SpaceID:         uint(sID),
	}).First(&result.Episode)

	// fetch old authors
	prevEpisodeAuthors := make([]model.EpisodeAuthor, 0)
	tx.Model(&model.EpisodeAuthor{}).Where(&model.EpisodeAuthor{
		EpisodeID: uint(result.Episode.ID),
	}).Find(&prevEpisodeAuthors)

	prevAuthorIDs := make([]uint, 0)
	for _, each := range prevEpisodeAuthors {
		prevAuthorIDs = append(prevAuthorIDs, each.AuthorID)
	}

	toCreateIDs, toDeleteIDs := arrays.Difference(prevAuthorIDs, episode.AuthorIDs)

	if len(toDeleteIDs) > 0 {
		tx.Model(&model.EpisodeAuthor{}).Where("author_id IN (?)", toDeleteIDs).Delete(&model.EpisodeAuthor{})
	}

	if len(toCreateIDs) > 0 {
		createEpisodeAuthors := make([]model.EpisodeAuthor, 0)
		for _, each := range toCreateIDs {
			epiAuth := model.EpisodeAuthor{
				EpisodeID: uint(result.Episode.ID),
				AuthorID:  each,
			}
			createEpisodeAuthors = append(createEpisodeAuthors, epiAuth)
		}

		if err = tx.Model(&model.EpisodeAuthor{}).Create(&createEpisodeAuthors).Error; err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// Fetch current authors
	authorMap, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	authorEpisodes := make([]model.EpisodeAuthor, 0)
	tx.Model(&model.EpisodeAuthor{}).Where(&model.EpisodeAuthor{
		EpisodeID: uint(id),
	}).Find(&authorEpisodes)

	for _, each := range authorEpisodes {
		result.Authors = append(result.Authors, authorMap[fmt.Sprint(each.AuthorID)])
	}

	// Update into meili index
	var publishedDate int64
	if result.PublishedDate == nil {
		publishedDate = 0
	} else {
		publishedDate = result.PublishedDate.Unix()
	}
	meiliObj := map[string]interface{}{
		"id":             result.Episode.ID,
		"kind":           "episode",
		"title":          result.Episode.Title,
		"slug":           result.Episode.Slug,
		"season":         result.Episode.Season,
		"episode":        result.Episode.Episode,
		"audio_url":      result.Episode.AudioURL,
		"description":    result.Episode.Description,
		"published_date": publishedDate,
		"space_id":       result.Episode.SpaceID,
		"medium_id":      result.Episode.MediumID,
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
