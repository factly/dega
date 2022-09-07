package space

import (
	//	"encoding/json"

	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	httpx "github.com/factly/dega-server/util/http"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// delete - Delete space
// @Summary Delete space
// @Description Delete space
// @Tags Space
// @ID delete-space
// @Consume json
// @Produce json
// @Param org_id header string true "Organisation ID"
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Success 200
// @Router /core/spaces/{space_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	spaceID := chi.URLParam(r, "space_id")
	sID, err := strconv.Atoi(spaceID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	orgID, err := util.GetOrganisationIDfromSpaceID(uint(sID), uint(uID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	applicationID, err := util.GetApplicationID(uint(uID), "dega")
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	spaceObjectforDega, err := util.GetSpacefromKavach(uint(uID), uint(orgID), uint(sID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	// getting the details for the space to be deleted
	client := httpx.CustomHttpClient()
	req, err := http.NewRequest("DELETE", viper.GetString("kavach_url")+fmt.Sprintf("/organisations/%d/applications/", orgID)+fmt.Sprintf("%d", applicationID)+"/spaces/"+spaceID, nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	if resp.StatusCode != 200 {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	defer resp.Body.Close()
	if config.SearchEnabled() {
		err = meilisearchx.DeleteDocument("dega", uint(sID), "space")
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		}
	}

	if util.CheckNats() {
		if err = util.NC.Publish("space.deleted", spaceObjectforDega); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	err = config.DB.Model(&model.SpacePermission{}).Where(&model.SpacePermission{
		SpaceID: uint(sID),
	}).Delete(&model.SpacePermission{}).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	renderx.JSON(w, http.StatusOK, nil)
}
