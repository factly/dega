package user

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/factly/dega-server/util/arrays"

	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"

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
// @Param user_id path string true "User ID"
// @Success 200 {object} []model.Permission
// @Router /core/users/{user_id}/permissions [get]
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

	userID := chi.URLParam(r, "user_id")
	id, err := strconv.Atoi(userID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	var result []model.Permission

	// check if the user is admin of organisation
	isAdmin := util.CheckSpaceKetoPermission("all", uint(oID), uint(uID))

	// fetch all the keto policies
	policyList, err := policy.GetAllPolicies()
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if isAdmin == nil {
		// logged user is admin and user_id is also admin's
		if id == uID {
			allPermission := []model.Permission{
				model.Permission{
					Resource: "admin",
					Actions:  []string{"admin"},
				},
			}
			renderx.JSON(w, http.StatusOK, allPermission)
			return
		}
		result = GetPermissions(int(oID), int(sID), id, policyList)
	} else {
		// logged user not admin
		errorx.Render(w, errorx.Parser(errorx.Message{
			Message: "not allowed",
			Code:    http.StatusUnauthorized,
		}))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}

// GetPermissions gets user's permissions
func GetPermissions(oID, sID, uID int, policyList []model.KetoPolicy) []model.Permission {
	permissionsMap := make(map[string][]string)
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
				for _, per := range polPermission {
					if _, found := permissionsMap[per.Resource]; !found {
						permissionsMap[per.Resource] = make([]string, 0)
					}
					permissionsMap[per.Resource] = arrays.Union(permissionsMap[per.Resource], per.Actions)
				}
			}
		}
	}

	for res, act := range permissionsMap {
		perm := model.Permission{
			Resource: res,
			Actions:  act,
		}
		permissions = append(permissions, perm)
	}
	return permissions
}
