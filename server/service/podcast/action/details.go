package podcast

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/service/podcast/service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get podcast by id
// @Summary Show a podcast by id
// @Description Get podcast by ID
// @Tags Podcast
// @ID get-podcast-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param podcast_id path string true "Podcast ID"
// @Success 200 {object} model.Podcast
// @Router /podcast/{podcast_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	podcastID := chi.URLParam(r, "podcast_id")
	id, err := strconv.Atoi(podcastID)

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

	renderx.JSON(w, http.StatusOK, result)
}
