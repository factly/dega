package episode

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

// details - Get episode by id
// @Summary Show a episode by id
// @Description Get episode by ID
// @Tags Episode
// @ID get-episode-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param episode_id path string true "Episode ID"
// @Success 200 {object} episodeData
// @Router /podcast/episodes/{episode_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
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

	episodeService := service.GetEpisodeService()

	result, serviceErr := episodeService.GetById(r.Context(), sID, id)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}
	renderx.JSON(w, http.StatusOK, result)
}
