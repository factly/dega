package spacePermission

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
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// request - Create space permission request
// @Summary Create space permission request
// @Description Create space permission request
// @Tags Space_Permissions
// @ID add-space-permission-request
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Request body spacePermissionRequest true "Request Object"
// @Success 201 {object} model.SpacePermissionRequest
// @Failure 400 {array} string
// @Router /core/permissions/spaces/request [post]
func create(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	request := spacePermissionRequest{}

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

	space := model.Space{}
	space.ID = uint(request.SpaceID)
	// Fetch space for which request is made
	err = config.DB.First(&space).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage("space not found", http.StatusNotFound)))
		return
	}

	isAdmin, err := util.CheckOwnerFromKavach(uID, int(space.OrganisationID))
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

	result := model.SpacePermissionRequest{
		Request: model.Request{
			Description: request.Description,
			Status:      "pending",
		},
		SpaceID:   uint(request.SpaceID),
		Posts:     request.Posts,
		Media:     request.Media,
		FactCheck: request.FactCheck,
	}

	err = config.DB.WithContext(context.WithValue(r.Context(), permissionContext, uID)).Model(&model.SpacePermissionRequest{}).Create(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	renderx.JSON(w, http.StatusCreated, result)
}
