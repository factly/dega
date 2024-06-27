package user

import (
	"net/http"

	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/zitadel"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// list response

type paging struct {
	Total int64  `json:"total"`
	Nodes []user `json:"nodes"`
}

type user struct {
	ID          string `json:"id"`
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
}

// list - Get users with space access
// @Summary Get users with space access
// @Description Get users with space access
// @Tags Users
// @ID get-space-users
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {object} paging
// @Router /core/users [get]
func list(w http.ResponseWriter, r *http.Request) {

	oID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	orgRole, err := util.GetOrgRoleFromContext(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	if orgRole != "admin" {
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// Get organisation ID

	res, err := zitadel.GetOrganisationUsers(r.Header.Get("authorization"), oID, []string{})
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	result := paging{
		Total: int64(len(res)),
	}

	users := make([]user, 0)

	for _, u := range res {
		users = append(users, user{
			ID:          u.ID,
			DisplayName: u.Human.Profile.DisplayName,
			Email:       u.Human.Email.Email,
		})
	}

	result.Nodes = users

	renderx.JSON(w, http.StatusOK, result)

}
