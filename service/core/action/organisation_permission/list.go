package organisation_permission

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/renderx"
)

// list - Get all organisation permissions
// @Summary Show all organisation permissions
// @Description Get all organisation permissions
// @Tags Organisation_Permissions
// @ID get-all-org-permissions
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {array} []model.OrganisationPermission
// @Router /core/organisations/permissions [get]
func list(w http.ResponseWriter, r *http.Request) {
	result := make([]model.OrganisationPermission, 0)
	config.DB.Model(&model.OrganisationPermission{}).Find(&result)

	renderx.JSON(w, http.StatusOK, result)
}
