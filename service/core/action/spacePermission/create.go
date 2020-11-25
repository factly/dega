package spacePermission

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// create - Create Space permission
// @Summary Create Space permission
// @Description Create Space permission
// @Tags Space_Permissions
// @ID add-space-permission
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Permission body spacePermission true "Permission Object"
// @Success 201 {object} model.SpacePermission
// @Failure 400 {array} string
// @Router /core/permissions/spaces [post]
func create(w http.ResponseWriter, r *http.Request) {
	permission := spacePermission{}

	err := json.NewDecoder(r.Body).Decode(&permission)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(permission)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	var totPerms int64
	config.DB.Model(&model.SpacePermission{}).Where(&model.SpacePermission{
		SpaceID: permission.SpaceID,
	}).Count(&totPerms)

	if totPerms > 0 {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	result := model.SpacePermission{
		SpaceID:   permission.SpaceID,
		FactCheck: permission.FactCheck,
	}

	err = config.DB.Create(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusCreated, result)
}
