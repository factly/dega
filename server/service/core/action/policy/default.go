package policy

import (
	"net/http"

	"github.com/factly/x/renderx"
)

// PolicyDataFile default json data file
var PolicyDataFile = "./data/policies.json"
var RolesDataFile = "./data/roles.json"

// createDefaults - Create Default Policies
// @Summary Create Default Policies
// @Description Create Default Policies
// @Tags Policy
// @ID add-default-policies
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 201 {object} paging
// @Failure 400 {array} string
// @Router /core/policies/default [post]
func createDefaults(w http.ResponseWriter, r *http.Request) {
	// uID, err := util.GetUser(r.Context())
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
	// 	return
	// }

	// sID, err := util.GetSpace(r.Context())
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
	// 	return
	// }

	// oID, err := util.GetOrganisation(r.Context())
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
	// 	return
	// }

	renderx.JSON(w, http.StatusCreated, nil)
}
