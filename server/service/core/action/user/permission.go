package user

import (
	"net/http"

	"github.com/factly/x/renderx"

	"github.com/factly/dega-server/service/core/model"
)

// userpermissions - Get user's permission
// @Summary Get user's permission
// @Description Get user's permission
// @Tags Users
// @ID get-users-permission
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param user_id path string true "User ID"
// @Success 200 {object} []model.Permission
// @Router /core/users/{user_id}/permissions [get]

func userpermissions(w http.ResponseWriter, r *http.Request) {

	var result []model.Permission

	renderx.JSON(w, http.StatusOK, result)
}
