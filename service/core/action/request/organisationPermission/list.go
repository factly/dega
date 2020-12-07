package organisationPermission

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"

	"github.com/factly/dega-server/service/core/model"
)

type paging struct {
	Nodes []model.OrganisationPermissionRequest `json:"nodes"`
	Total int64                                 `json:"total"`
}

// list - Get all organisation permissions requests
// @Summary Show all organisation permissions requests
// @Description Get all organisation permissions requests
// @Tags Organisation_Permissions_Request
// @ID get-all-org-permissions-requests
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param status query string false "Status"
// @Success 200 {array} paging
// @Router /core/requests/organisation-permissions [get]
func list(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	if status == "" {
		status = "pending"
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	result := paging{}
	result.Nodes = make([]model.OrganisationPermissionRequest, 0)

	tx := config.DB.Model(&model.OrganisationPermissionRequest{})

	if status != "all" {
		tx.Where("status = ?", status)
	}

	tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes)

	renderx.JSON(w, http.StatusOK, result)
}
