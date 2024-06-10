package space

import (
	"context"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// approve - approve space permission
// @Summary approve space permission
// @Description approve space permission
// @Tags Space_Permissions_Request
// @ID approve-space-permission
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param request_id path string true "Request ID"
// @Success 201 {object} model.SpacePermission
// @Failure 400 {array} string
// @Router /core/requests/spaces/{request_id}/approve [post]
func approve(w http.ResponseWriter, r *http.Request) {

	uID, err := util.GetUser(r.Context())
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

	request := model.SpacePermissionRequest{}
	request.ID = uint(id)

	// Check if the request exist or not
	err = config.DB.Where(&model.SpacePermissionRequest{
		Request: model.Request{Status: "pending"},
	}).First(&request).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	spacePermission := model.SpacePermission{}

	// Check if the permission for the Space already exist
	err = config.DB.Model(&model.SpacePermission{}).Where(&model.SpacePermission{
		SpaceID: request.SpaceID,
	}).First(&spacePermission).Error

	tx := config.DB.WithContext(context.WithValue(r.Context(), permissionContext, uID)).Begin()

	result := model.SpacePermission{
		Base:      config.Base{UpdatedByID: uint(uID)},
		FactCheck: request.FactCheck,
		Media:     request.Media,
		Posts:     request.Posts,
		Podcast:   request.Podcast,
		Episodes:  request.Episodes,
		SpaceID:   request.SpaceID,
	}

	if err != nil {
		// Create a space permission
		err = tx.Model(&model.SpacePermission{}).Create(&result).Error
	} else {
		// Update the space permission
		tx.Model(&spacePermission).Select("FactCheck", "Podcast").Updates(model.SpacePermission{
			FactCheck: result.FactCheck,
			Podcast:   result.Podcast,
		})
		err = tx.Model(&spacePermission).Updates(&result).First(&result).Error
	}

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Mark request as approved
	err = tx.Model(&request).Updates(&model.SpacePermissionRequest{
		Request: model.Request{
			Base:   config.Base{UpdatedByID: uint(uID)},
			Status: "approved",
		},
	}).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, result)
}
