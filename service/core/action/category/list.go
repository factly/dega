package category

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/render"
)

// paging response
type paging struct {
	Total int              `json:"total"`
	Nodes []model.Category `json:"nodes"`
}

func list(w http.ResponseWriter, r *http.Request) {

	data := paging{}

	offset, limit := util.Paging(r.URL.Query())

	config.DB.Model(&model.Category{}).Count(&data.Total).Offset(offset).Limit(limit).Preload("Medium").Find(&data.Nodes)

	render.JSON(w, http.StatusOK, data)
}
