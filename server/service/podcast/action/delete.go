package podcast

import (
	"net/http"

	"github.com/factly/dega-server/service/podcast/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

// delete - Delete podcast by id
// @Summary Delete a podcast
// @Description Delete podcast by ID
// @Tags Podcast
// @ID delete-podcast-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param podcast_id path string true "Podcast ID"
// @Success 200
// @Router /podcasts/{podcast_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
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

	podcastService := service.GetPodcastService()

	result, serviceErr := podcastService.GetById(sID, id)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	_ = podcastService.Delete(sID, id, result)

	// if config.SearchEnabled() {
	// 	_ = meilisearch.DeleteDocument("dega", result.ID, "podcast")
	// }

	if util.CheckNats() {
		if util.CheckWebhookEvent("podcast.deleted", sID.String(), r) {
			if err = util.NC.Publish("podcast.deleted", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}
	renderx.JSON(w, http.StatusOK, nil)
}
