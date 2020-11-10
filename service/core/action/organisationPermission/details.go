package organisationPermission

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/util"
	"github.com/spf13/viper"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get tag by id
// @Summary Show a tag by id
// @Description Get tag by ID
// @Tags Organisation_Permissions
// @ID get-org-permission-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param permission_id path string true "Permission ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {object} model.OrganisationPermission
// @Router /core/organisations/permissions/{permission_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	permissionID := chi.URLParam(r, "permission_id")
	id, err := strconv.Atoi(permissionID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	oID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if oID != id && oID != viper.GetInt("organisation_id") {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Message{
			Code:    http.StatusUnauthorized,
			Message: "cannot get details of other organisation",
		}))
		return
	}

	result := model.OrganisationPermission{}
	err = config.DB.Model(&model.OrganisationPermission{}).Where(&model.OrganisationPermission{
		OrganisationID: uint(id),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
