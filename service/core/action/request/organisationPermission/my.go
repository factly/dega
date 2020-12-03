package organisationPermission

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// my - Get all my organisation permissions requests
// @Summary Show all my organisation permissions requests
// @Description Get all my organisation permissions requests
// @Tags Organisation_Permissions_Request
// @ID get-all-my-org-permissions-requests
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {array} paging
// @Router /core/requests/organisation-permissions/my [get]
func my(w http.ResponseWriter, r *http.Request) {
	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	result := paging{}
	result.Nodes = make([]model.OrganisationPermissionRequest, 0)

	config.DB.Model(&model.OrganisationPermissionRequest{}).Where(&model.OrganisationPermissionRequest{
		OrganisationID: uint(sID),
	}).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes)

	renderx.JSON(w, http.StatusOK, result)
}
