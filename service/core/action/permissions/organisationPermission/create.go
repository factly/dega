package organisationPermission

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/spf13/viper"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// create - Create organisation permission
// @Summary Create organisation permission
// @Description Create organisation permission
// @Tags Organisation_Permissions
// @ID add-org-permission
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Permission body organisationPermission true "Permission Object"
// @Success 201 {object} model.OrganisationPermission
// @Failure 400 {array} string
// @Router /core/permissions/organisations [post]
func create(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	permission := organisationPermission{}

	err = json.NewDecoder(r.Body).Decode(&permission)
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

	if permission.Spaces == 0 {
		permission.Spaces = viper.GetInt64("default_number_of_spaces")
	}

	var totPerms int64
	config.DB.Model(&model.OrganisationPermission{}).Where(&model.OrganisationPermission{
		OrganisationID: permission.OrganisationID,
	}).Count(&totPerms)

	if totPerms > 0 {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage("organisation's permission already exist", http.StatusUnprocessableEntity)))
		return
	}

	result := model.OrganisationPermission{
		OrganisationID: permission.OrganisationID,
		Spaces:         permission.Spaces,
	}

	config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Model(&model.OrganisationPermission{}).Create(&result)

	renderx.JSON(w, http.StatusCreated, result)
}
