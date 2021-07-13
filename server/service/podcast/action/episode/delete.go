package episode

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete episode by id
// @Summary Delete a episode
// @Description Delete episode by ID
// @Tags Episode
// @ID delete-episode-by-id
// @Param X-User header string true "User ID"
// @Param episode_id path string true "Episode ID"
// @Param X-Space header string true "Space ID"
// @Success 200
// @Failure 400 {array} string
// @Router  /podcast/episodes/{episode_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	episodeID := chi.URLParam(r, "episode_id")
	id, err := strconv.Atoi(episodeID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
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

	tx := config.DB.Begin()
	tx.Delete(&result)

	tx.Model(&model.EpisodeAuthor{}).Where(&model.EpisodeAuthor{
		EpisodeID: uint(id),
	}).Delete(&model.EpisodeAuthor{})

	_ = meilisearchx.DeleteDocument("dega", result.ID, "episode")

	tx.Commit()
	if util.CheckNats() {
		if err = util.NC.Publish("episode.deleted", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}
	renderx.JSON(w, http.StatusOK, nil)
}
