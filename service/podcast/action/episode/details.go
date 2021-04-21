package episode

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/podcast/model"
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

	result := episodeData{}

	result.Episode.ID = uint(id)

	err = config.DB.Model(&model.Episode{}).Preload("Podcast").Preload("Podcast.Medium").Where(&model.Episode{
		SpaceID: uint(sID),
	}).First(&result.Episode).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// Adding authors in response
	authorMap, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	authorEpisodes := make([]model.EpisodeAuthor, 0)
	config.DB.Model(&model.EpisodeAuthor{}).Where(&model.EpisodeAuthor{
		EpisodeID: uint(id),
	}).Find(&authorEpisodes)

	for _, each := range authorEpisodes {
		result.Authors = append(result.Authors, authorMap[fmt.Sprint(each.AuthorID)])
	}

	renderx.JSON(w, http.StatusOK, result)
}
