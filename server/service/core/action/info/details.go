package info

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	podcastModel "github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// details - Get info by id
// @Summary Show a info by id
// @Description Get info by ID
// @Tags Info
// @ID get-info-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param info_id path string true "Info ID"
// @Success 200 {object} model.Info
// @Router /core/info [get]
func details(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := &model.Info{}

	err = config.DB.Model(&model.Category{}).Where(&model.Category{
		SpaceID: authCtx.SpaceID,
	}).Count(&result.Categories).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = config.DB.Model(&model.Tag{}).Where(&model.Tag{
		SpaceID: authCtx.SpaceID,
	}).Count(&result.Tags).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = config.DB.Model(&podcastModel.Podcast{}).Where(&podcastModel.Podcast{
		SpaceID: authCtx.SpaceID,
	}).Count(&result.Podcasts).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = config.DB.Model(&podcastModel.Episode{}).Where(&podcastModel.Episode{
		SpaceID: authCtx.SpaceID,
	}).Count(&result.Episodes).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	result.Posts = make([]model.PostCount, 0)

	query := `SELECT de_format.slug, de_post.status, COUNT(*) 
	FROM de_post 
	JOIN de_format ON de_post.format_id = de_format.id 
	WHERE is_page = false 
	AND de_post.deleted_at IS NULL 
	AND de_post.space_id = ? 
	GROUP BY de_post.status, de_format.slug`

	err = config.DB.Raw(query, authCtx.SpaceID).Scan(&result.Posts).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
