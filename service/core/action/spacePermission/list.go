package spacePermission

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/renderx"
)

type spaceWithPermissions struct {
	model.Space
	Permission *model.SpacePermission `json:"permission"`
}

type paging struct {
	Nodes []spaceWithPermissions `json:"nodes"`
	Total int64                  `json:"total"`
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
// @Router /core/permissions/spaces [get]
func list(w http.ResponseWriter, r *http.Request) {
	result := paging{}
	result.Nodes = make([]spaceWithPermissions, 0)

	// Get all spaces
	spaceList := make([]model.Space, 0)
	config.DB.Model(&model.Space{}).Count(&result.Total).Find(&spaceList)

	if len(spaceList) == 0 {
		renderx.JSON(w, http.StatusOK, result)
		return
	}

	// Get all permissions
	permissionsList := make([]model.SpacePermission, 0)
	config.DB.Model(&model.SpacePermission{}).Find(&permissionsList)

	permissionsMap := make(map[uint]model.SpacePermission)
	for _, perm := range permissionsList {
		permissionsMap[perm.SpaceID] = perm
	}

	for _, space := range spaceList {
		spacePerm := spaceWithPermissions{}
		spacePerm.Space = space
		if perm, found := permissionsMap[space.ID]; found {
			spacePerm.Permission = &perm
		}
		result.Nodes = append(result.Nodes, spacePerm)
	}

	renderx.JSON(w, http.StatusOK, result)
}
