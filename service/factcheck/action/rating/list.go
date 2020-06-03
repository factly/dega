package rating

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// list response
type paging struct {
	Total int            `json:"total"`
	Nodes []model.Rating `json:"nodes"`
}

// list - Get all ratings
// @Summary Show all ratings
// @Description Get all ratings
// @Tags Rating
// @ID get-all-ratings
// @Produce  json
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /{space_id}/factcheck/ratings [get]
func list(w http.ResponseWriter, r *http.Request) {

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	result := paging{}

	offset, limit := util.Paging(r.URL.Query())

	err = config.DB.Model(&model.Rating{}).Preload("Medium").Where(&model.Rating{
		SpaceID: uint(sid),
	}).Count(&result.Total).Order("id desc").Offset(offset).Limit(limit).Find(&result.Nodes).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
