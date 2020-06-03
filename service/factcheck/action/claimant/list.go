package claimant

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
	Total int              `json:"total"`
	Nodes []model.Claimant `json:"nodes"`
}

// list - Get all claimants
// @Summary Show all claimants
// @Description Get all claimants
// @Tags Claimant
// @ID get-all-claimants
// @Produce  json
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /{space_id}/factcheck/claimants [get]
func list(w http.ResponseWriter, r *http.Request) {

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	result := paging{}

	offset, limit := util.Paging(r.URL.Query())

	err = config.DB.Model(&model.Claimant{}).Preload("Medium").Where(&model.Claimant{
		SpaceID: uint(sid),
	}).Count(&result.Total).Offset(offset).Order("id desc").Limit(limit).Find(&result.Nodes).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
