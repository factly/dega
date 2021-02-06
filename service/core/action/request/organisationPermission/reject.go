package organisationPermission

import (
	"context"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// reject - reject organisation permission
// @Summary reject organisation permission
// @Description reject organisation permission
// @Tags Organisation_Permissions_Request
// @ID reject-org-permission
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param request_id path string true "Request ID"
// @Success 200
// @Failure 400 {array} string
// @Router /core/requests/organisation-permissions/{request_id}/reject [post]
func reject(w http.ResponseWriter, r *http.Request) {

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

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
	err = config.DB.Where(&model.OrganisationPermissionRequest{
		Request: model.Request{Status: "pending"},
	}).First(&request).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// Mark request as rejected
	err = config.DB.WithContext(context.WithValue(r.Context(), permissionContext, uID)).Model(&request).Updates(&model.OrganisationPermissionRequest{
		Request: model.Request{
			Base:   config.Base{UpdatedByID: uint(uID)},
			Status: "rejected",
		},
	}).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
