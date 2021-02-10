package organisation

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"

	"github.com/factly/dega-server/service/core/model"

	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// request - Create organisation permission request
// @Summary Create organisation permission request
// @Description Create organisation permission request
// @Tags Organisation_Permissions_Request
// @ID add-org-permission-request
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Request body organisationPermissionRequest true "Request Object"
// @Success 201 {object} model.OrganisationPermissionRequest
// @Failure 400 {array} string
// @Router /core/requests/organisations [post]
func Create(w http.ResponseWriter, r *http.Request) {

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	request := organisationPermissionRequest{}

	err = json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(request)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	isAdmin, err := util.CheckOwnerFromKavach(uID, int(request.OrganisationID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusInternalServerError)))
		return
	}

	if !isAdmin {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := model.OrganisationPermissionRequest{
		Request: model.Request{
			Description: request.Description,
			Status:      "pending",
		},
		OrganisationID: request.OrganisationID,
		Spaces:         request.Spaces,
	}

	err = config.DB.WithContext(context.WithValue(r.Context(), permissionContext, uID)).Model(&model.OrganisationPermissionRequest{}).Create(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	renderx.JSON(w, http.StatusCreated, result)
}
