package organisation

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
)

type orgPermissionRes struct {
	model.OrganisationPermission
	SpacePermissions []model.SpacePermission `json:"space_permissions"`
	IsAdmin          bool                    `json:"is_admin,omitempty"`
}

// details - Get my organisation permissions
// @Summary Show a my organisation permissions
// @Description Get my organisation permissions
// @Tags Organisation_Permissions
// @ID get-org-permission-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {object} orgPermissionRes
// @Router /core/permissions/organisations/my [get]
func details(w http.ResponseWriter, r *http.Request) {
	oID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
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
		err = json.NewDecoder(resp.Body).Decode(&policy)
		if err == nil && len(policy.Subjects) > 0 && policy.Subjects[0] == fmt.Sprint(oID) {
			isOwner, _ := util.CheckOwnerFromKavach(uID, oID)
			result.IsAdmin = isOwner
		}
	}

	// Get all spaces of organisation
	spaceList := make([]model.Space, 0)
	config.DB.Model(&model.Space{}).Where(&model.Space{
		OrganisationID: oID,
	}).Find(&spaceList)

	spaceIDs := make([]uint, 0)
	for _, space := range spaceList {
		spaceIDs = append(spaceIDs, space.ID)
	}

	// Fetch all the spaces's permissions
	err = config.DB.Model(&model.SpacePermission{}).Where("space_id IN (?)", spaceIDs).Find(&result.SpacePermissions).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
