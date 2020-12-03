package spacePermission

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

type paging struct {
	Nodes []model.SpacePermissionRequest `json:"nodes"`
	Total int64                          `json:"total"`
}

// list - Get all space permissions requests
// @Summary Show all space permissions requests
// @Description Get all space permissions requests
// @Tags Space_Permissions_Request
// @ID get-all-space-permissions-requests
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param status query string false "Status"
// @Success 200 {array} paging
// @Router /core/requests/space-permissions [get]
func list(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	if status == "" {
		status = "requested"
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	result := paging{}
	result.Nodes = make([]model.SpacePermissionRequest, 0)

	config.DB.Model(&model.SpacePermissionRequest{}).Where("status = ?", status).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes)

	renderx.JSON(w, http.StatusOK, result)
}
