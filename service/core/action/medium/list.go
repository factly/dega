package medium

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// list response
type paging struct {
	Total int            `json:"total"`
	Nodes []model.Medium `json:"nodes"`
}

// list - Get all media
// @Summary Show all media
// @Description Get all media
// @Tags Medium
// @ID get-all-media
// @Produce  json
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {array} model.Medium
// @Router /{space_id}/core/media [get]
func list(w http.ResponseWriter, r *http.Request) {

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	result := paging{}

	offset, limit := util.Paging(r.URL.Query())

	err = config.DB.Model(&model.Medium{}).Count(&result.Total).Order("id desc").Offset(offset).Limit(limit).Where(&model.Medium{
		SpaceID: uint(sid),
	}).Find(&result.Nodes).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
