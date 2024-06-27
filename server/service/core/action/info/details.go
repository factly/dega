package info

import (
	"fmt"
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

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Info{}

	err = config.DB.Model(&model.Category{}).Where(&model.Category{
		SpaceID: sID,
	}).Count(&result.Categories).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = config.DB.Model(&model.Tag{}).Where(&model.Tag{
		SpaceID: sID,
	}).Count(&result.Tags).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = config.DB.Model(&podcastModel.Podcast{}).Where(&podcastModel.Podcast{
		SpaceID: sID,
	}).Count(&result.Podcasts).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = config.DB.Model(&podcastModel.Episode{}).Where(&podcastModel.Episode{
		SpaceID: sID,
	}).Count(&result.Episodes).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	result.Posts = make([]model.PostCount, 0)

	err = config.DB.Raw(fmt.Sprint("SELECT  de_formats.slug, de_posts.status, COUNT (*) FROM de_posts JOIN de_formats ON de_posts.format_id = de_formats.id WHERE is_page = false AND de_posts.deleted_at IS NULL AND de_posts.space_id = ", sID, " GROUP BY de_posts.status, de_formats.slug")).Scan(&result.Posts).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
