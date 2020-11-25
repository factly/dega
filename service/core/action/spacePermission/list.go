package spacePermission

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/renderx"
)

type paging struct {
	Nodes []model.SpacePermission `json:"nodes"`
	Total int64                   `json:"total"`
}

// list - Get all Space permissions
// @Summary Show all Space permissions
// @Description Get all Space permissions
// @Tags Space_Permissions
// @ID get-all-space-permissions
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param q query string false "Query"
// @Success 200 {array} paging
// @Router /core/spaces/permissions [get]
func list(w http.ResponseWriter, r *http.Request) {
	result := paging{}
	result.Nodes = make([]model.SpacePermission, 0)

	config.DB.Model(&model.SpacePermission{}).Count(&result.Total).Preload("Space").Find(&result.Nodes)

	renderx.JSON(w, http.StatusOK, result)
}
