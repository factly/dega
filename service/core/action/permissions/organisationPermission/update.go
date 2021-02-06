package organisationPermission

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// update - Update Organisation permission by id
// @Summary Update a Organisation permission by id
// @Description Update Organisation permission by ID
// @Tags Organisation_Permissions
// @ID update-org-permission-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param permission_id path string true "Permission ID"
// @Param X-Space header string true "Space ID"
// @Param Permission body organisationPermission false "Permission Body"
// @Success 200 {object} model.OrganisationPermission
// @Router /core/permissions/organisations/{permission_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	permissionID := chi.URLParam(r, "permission_id")
	id, err := strconv.Atoi(permissionID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
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

	result := model.OrganisationPermission{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	if permission.Spaces == 0 {
		permission.Spaces = viper.GetInt64("default_number_of_spaces")
	}

	tx := config.DB.Begin()

	err = tx.Model(&model.OrganisationPermission{}).Model(&result).Updates(&model.OrganisationPermission{
		Base:   config.Base{UpdatedByID: uint(uID)},
		Spaces: permission.Spaces,
	}).First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, result)
}
