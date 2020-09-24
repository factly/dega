package user

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/factly/x/renderx"

	"github.com/factly/dega-server/service/core/action/policy"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
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
// @Success 200 {object} []model.Permission
// @Router /core/users/permissions/my [get]
func userpermissions(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	oID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// check if the user is admin of organisation
	err = util.CheckSpaceKetoPermission("all", uint(oID), uint(uID))
	if err == nil {
		allPermission := []model.Permission{
			model.Permission{
				Resource: "admin",
				Actions:  []string{"admin"},
			},
		}
		renderx.JSON(w, http.StatusOK, allPermission)
		return
	}

	// Get all policies
	policyList, err := policy.GetAllPolicies()
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	spacePrefix := fmt.Sprint("id:org:", oID, ":app:dega:space:", sID, ":")
	permissions := make([]model.Permission, 0)

	for _, pol := range policyList {
		if strings.HasPrefix(pol.ID, spacePrefix) {
			var isPresent bool = false
			for _, user := range pol.Subjects {
				if user == fmt.Sprint(uID) {
					isPresent = true
					break
				}
			}

			if isPresent {
				polPermission := policy.GetPermissions(pol, uint(uID))
				permissions = append(permissions, polPermission...)
			}
		}
	}

	renderx.JSON(w, http.StatusOK, permissions)
}
