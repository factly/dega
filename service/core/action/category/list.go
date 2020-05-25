package category

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/render"
)

// list response
type paging struct {
	Total int              `json:"total"`
	Nodes []model.Category `json:"nodes"`
}

// list - Get all categories
// @Summary Show all categories
// @Description Get all categories
// @Tags Category
// @ID get-all-categories
// @Produce  json
// @Param X-User header string true "User ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /core/categories [get]
func list(w http.ResponseWriter, r *http.Request) {
	result := paging{}

	offset, limit := util.Paging(r.URL.Query())

	err := config.DB.Model(&model.Category{}).Preload("Medium").Count(&result.Total).Order("id desc").Offset(offset).Limit(limit).Find(&result.Nodes).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
