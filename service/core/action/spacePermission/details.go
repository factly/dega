package spacePermission

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get Space permissions
// @Summary Show a Space permissions
// @Description Get Space permissions
// @Tags Space_Permissions
// @ID get-space-permission-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param permission_id path string true "Permission ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {object} model.SpacePermission
// @Router /core/permissions/spaces/{permission_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	permissionID := chi.URLParam(r, "permission_id")
	id, err := strconv.Atoi(permissionID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := model.SpacePermission{}
	result.ID = uint(id)

	err = config.DB.Preload("Space").First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
