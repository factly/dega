package info

import (
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	podcastModel "github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
)

type article struct {
	Status string `json:"status"`
	Slug   string `json:"slug"`
	Count  int64  `json:"count"`
}

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

	sID, err := middlewarex.GetSpace(r.Context())
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
		SpaceID: uint(sID),
	}).Count(&result.Categories).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = config.DB.Model(&model.Tag{}).Where(&model.Tag{
		SpaceID: uint(sID),
	}).Count(&result.Tags).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = config.DB.Model(&podcastModel.Podcast{}).Where(&podcastModel.Podcast{
		SpaceID: uint(sID),
	}).Count(&result.Podcasts).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = config.DB.Model(&podcastModel.Episode{}).Where(&podcastModel.Episode{
		SpaceID: uint(sID),
	}).Count(&result.Episodes).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	result.Posts = make([]model.PostCount, 0)

	err = config.DB.Raw(fmt.Sprint("SELECT  formats.slug, posts.status, COUNT (*) FROM posts JOIN formats ON posts.format_id = formats.id where posts.space_id = ", sID, "group by posts.status, formats.slug")).Scan(&result.Posts).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
