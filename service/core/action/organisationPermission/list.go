package organisationPermission

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

type paging struct {
	Nodes []model.OrganisationPermission `json:"nodes"`
	Total int64                          `json:"total"`
}

// list - Get all organisation permissions
// @Summary Show all organisation permissions
// @Description Get all organisation permissions
// @Tags Organisation_Permissions
// @ID get-all-org-permissions
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {array} paging
// @Router /core/organisations/permissions [get]
func list(w http.ResponseWriter, r *http.Request) {
	result := paging{}
	result.Nodes = make([]model.OrganisationPermission, 0)

	offset, limit := paginationx.Parse(r.URL.Query())

	config.DB.Model(&model.OrganisationPermission{}).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes)

	renderx.JSON(w, http.StatusOK, result)
}
