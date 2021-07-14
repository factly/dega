package podcast

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

	result := &model.Podcast{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Podcast{
		SpaceID: uint(sID),
	}).Preload("Categories").First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tx := config.DB.Begin()

	// delete all associations
	if len(result.Categories) > 0 {
		_ = tx.Model(&result).Association("Categories").Delete(result.Categories)
	}

	tx.Model(&model.Podcast{}).Delete(&result)

	if config.SearchEnabled() {
		_ = meilisearchx.DeleteDocument("dega", result.ID, "podcast")
	}

	tx.Commit()
	if util.CheckNats() {
		if err = util.NC.Publish("podcast.deleted", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}
	renderx.JSON(w, http.StatusOK, nil)
}
