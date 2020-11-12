package organisationPermission

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/dega-server/util"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

type orgPermissionRes struct {
	model.OrganisationPermission
	IsAdmin bool `json:"is_admin,omitempty"`
}

// details - Get tag by id
// @Summary Show a tag by id
// @Description Get tag by ID
// @Tags Organisation_Permissions
// @ID get-org-permission-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param permission_id path string true "Permission ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {object} orgPermissionRes
// @Router /core/organisations/permissions/my [get]
func details(w http.ResponseWriter, r *http.Request) {
	oID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	result := orgPermissionRes{}
	err = config.DB.Model(&model.OrganisationPermission{}).Where(&model.OrganisationPermission{
		OrganisationID: uint(oID),
	}).First(&result.OrganisationPermission).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	resp, _ := util.KetoGetRequest("/engines/acp/ory/regex/policies/app:dega:superorg")

	if resp.StatusCode == http.StatusOK {
		var policy model.KetoPolicy
		json.NewDecoder(resp.Body).Decode(&policy)

		if len(policy.Subjects) > 0 && policy.Subjects[0] == fmt.Sprint(oID) {
			result.IsAdmin = true
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
