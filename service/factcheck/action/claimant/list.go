package claimant

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/render"
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
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /factcheck/claimants [get]
func list(w http.ResponseWriter, r *http.Request) {

	result := paging{}

	offset, limit := util.Paging(r.URL.Query())

	err := config.DB.Model(&model.Claimant{}).Preload("Medium").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
