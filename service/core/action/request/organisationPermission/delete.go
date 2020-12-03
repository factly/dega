package organisationPermission

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

// delete - Delete Organisation permission request by id
// @Summary Delete a Organisation permission request
// @Description Delete Organisation permission request by ID
// @Tags Organisation_Permissions_Request
// @ID delete-org-permission-request-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param request_id path string true "Request ID"
// @Success 200
// @Failure 400 {array} string
// @Router /core/requests/organisation-permissions/{request_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	requestID := chi.URLParam(r, "request_id")
	id, err := strconv.Atoi(requestID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	request := model.OrganisationPermissionRequest{}
	request.ID = uint(id)

	// Check if the request exist or not
	err = config.DB.First(&request).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	config.DB.Delete(&request)

	renderx.JSON(w, http.StatusOK, nil)
}
