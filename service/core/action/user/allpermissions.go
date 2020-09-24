package user

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/action/policy"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

type allPermissionRes struct {
	model.Author
	Permissions []model.Permission `json:"permissions"`
}

// allpermissions - Get all user's permission
// @Summary Get all user's permission
// @Description Get all user's permission
// @Tags Users
// @ID get-all-users-permission
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {object} []allPermissionRes
// @Router /core/users/permissions [get]
func allpermissions(w http.ResponseWriter, r *http.Request) {
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
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Message{
			Code:    http.StatusUnauthorized,
			Message: err.Error(),
		}))
		return
	}

	// Get all policies
	policyList, err := policy.GetAllPolicies()
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// Get author map
	userMap, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	permissionMap := map[string][]model.Permission{}

	spacePrefix := fmt.Sprint("id:org:", oID, ":app:dega:space:", sID, ":")

	for _, pol := range policyList {
		if strings.HasPrefix(pol.ID, spacePrefix) {
			for _, subject := range pol.Subjects {

				if subject == fmt.Sprint(uID) {
					continue
				}

				usrID, _ := strconv.Atoi(subject)
				if _, found := permissionMap[subject]; !found {
					permissionMap[subject] = make([]model.Permission, 0)
				}
				polPermission := policy.GetPermissions(pol, uint(usrID))
				permissionMap[subject] = append(permissionMap[subject], polPermission...)
			}

		}
	}

	result := make([]allPermissionRes, 0)

	for id, permission := range permissionMap {

		if aut, found := userMap[id]; found {
			userpermission := allPermissionRes{
				Author:      aut,
				Permissions: permission,
			}

			result = append(result, userpermission)
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
