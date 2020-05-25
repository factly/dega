package tag

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/render"
)

// list response
type paging struct {
	Total int         `json:"total"`
	Nodes []model.Tag `json:"nodes"`
}

// list - Get all tags
// @Summary Show all tags
// @Description Get all tags
// @Tags Tag
// @ID get-all-tags
// @Produce  json
// @Param X-User header string true "User ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {array} model.Tag
// @Router /core/tags [get]
func list(w http.ResponseWriter, r *http.Request) {

	result := paging{}

	offset, limit := util.Paging(r.URL.Query())

	err := config.DB.Model(&model.Tag{}).Count(&result.Total).Order("id asc").Offset(offset).Limit(limit).Find(&result.Nodes).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
