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
// @Success 201 {object} episodeData
// @Failure 400 {array} string
// @Router /podcast/episodes [post]
func create(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
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

	result, serviceErr := episodeService.Create(r.Context(), authCtx.SpaceID, authCtx.UserID, authCtx.OrganisationID, episode)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}
	// Insert into meili index
	var publishedDate int64
	if result.PublishedDate == nil {
		publishedDate = 0
	} else {
		publishedDate = result.PublishedDate.Unix()
	}

	meiliObj := map[string]interface{}{
		"id":             result.Episode.ID.String(),
		"kind":           "episode",
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
		_ = meilisearch.AddDocument("dega", meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("episode.created", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("episode.created", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}
	renderx.JSON(w, http.StatusCreated, result)
}
