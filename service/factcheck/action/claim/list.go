package claim

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/render"
)

// paging response
type paging struct {
	Total int           `json:"total"`
	Nodes []model.Claim `json:"nodes"`
}

func list(w http.ResponseWriter, r *http.Request) {

	result := paging{}

	offset, limit := util.Paging(r.URL.Query())

	config.DB.Model(&model.Claim{}).Count(&result.Total).Offset(offset).Limit(limit).Preload("Rating").Preload("Claimant").Preload("Rating.Medium").Preload("Claimant.Medium").Find(&result.Nodes)

	render.JSON(w, http.StatusOK, result)
}
