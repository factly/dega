package podcast

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

// update - Update podcast by id
// @Summary Update a podcast by id
// @Description Update podcast by ID
// @Tags Podcast
// @ID update-podcast-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param podcast_id path string true "Podcast ID"
// @Param X-Space header string true "Space ID"
// @Param Podcast body podcast false "Podcast"
// @Success 200 {object} model.Podcast
// @Router /podcast/{podcast_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	podcastID := chi.URLParam(r, "podcast_id")
	id, err := uuid.Parse(podcastID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	podcast := &service.Podcast{}
	err = json.NewDecoder(r.Body).Decode(&podcast)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	podcastService := service.GetPodcastService()

	result, serviceErr := podcastService.Update(authCtx.SpaceID, id, authCtx.UserID, podcast)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}
	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":           result.ID,
		"kind":         "podcast",
		"title":        result.Title,
		"slug":         result.Slug,
		"description":  result.Description,
		"language":     result.Language,
		"category_ids": podcast.CategoryIDs,
		"space_id":     result.SpaceID,
		"medium_id":    result.MediumID,
	}

	if config.SearchEnabled() {
		_ = meilisearch.UpdateDocument("dega", meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("podcast.updated", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("podcast.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
