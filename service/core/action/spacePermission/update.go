package spacePermission

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/util"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

// update - Update Space permission by id
// @Summary Update a Space permission by id
// @Description Update Space permission by ID
// @Tags Space_Permissions
// @ID update-space-permission-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param permission_id path string true "Permission ID"
// @Param X-Space header string true "Space ID"
// @Param Permission body spacePermission false "Permission Body"
// @Success 200 {object} model.SpacePermission
// @Router /core/permissions/spaces/{permission_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	permissionID := chi.URLParam(r, "permission_id")
	id, err := strconv.Atoi(permissionID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	permission := spacePermission{}

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

	result := model.SpacePermission{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	err = config.DB.Model(&result).Select("FactCheck", "UpdatedAt", "UpdatedByID").Updates(&model.SpacePermission{
		Base:      config.Base{UpdatedByID: uint(uID)},
		FactCheck: permission.FactCheck,
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
