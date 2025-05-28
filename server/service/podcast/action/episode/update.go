package episode

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/podcast/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
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

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	episodeID := chi.URLParam(r, "episode_id")
	id, err := uuid.Parse(episodeID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	episode := &service.Episode{}
	err = json.NewDecoder(r.Body).Decode(&episode)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	episodeService := service.GetEpisodeService()

	result, serviceErr := episodeService.Update(r.Context(), authCtx.SpaceID, id, authCtx.UserID, authCtx.OrganisationID, r.Header.Get("Authorization"), episode)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
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
		"title":          result.Title,
		"slug":           result.Slug,
		"season":         result.Season,
		"episode":        result.Episode,
		"audio_url":      result.AudioURL,
		"podcast_id":     result.PodcastID,
		"description":    result.Description,
		"published_date": publishedDate,
		"space_id":       result.SpaceID,
		"medium_id":      result.MediumID,
	}

	if config.SearchEnabled() {
		_ = meilisearch.UpdateDocument(meiliIndex, meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("episode.updated", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("episode.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}
	renderx.JSON(w, http.StatusOK, result)
}
