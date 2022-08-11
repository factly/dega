package space

import (
	//	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
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
	// space := map[string]interface{}{}

	// err = json.NewDecoder(r.Body).Decode(&space)

	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.DecodeError()))
	// 	return
	// }

	// spaceOrgID := int(space["organisation_id"].(float64))
	// if spaceOrgID == 0 {
	// 	return
	// }

	spaceID := chi.URLParam(r, "space_id")
	sID, err := strconv.Atoi(spaceID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Space{}
	result.ID = uint(sID)

	req, err := http.NewRequest("DELETE", viper.GetString("kavach_url")+"/organisations/1/applications/"+viper.GetString("dega_application_id")+"/spaces/"+spaceID, nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		return
	}
	if resp.StatusCode != 200 {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	//	fmt.Println(resp)

	// check record exists or not
	// err = config.DB.First(&result).Error
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
	// 	return
	// }

	// if result.OrganisationID == 0 {
	// 	return
	// }

	// err = util.CheckSpaceKetoPermission("delete", uint(result.OrganisationID), uint(uID))
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusUnauthorized)))
	// 	return
	// }

	// tx := config.DB.Begin()
	// tx.Model(&model.Space{}).Delete(&result)

	if config.SearchEnabled() {
		_ = meilisearchx.DeleteDocument("dega", result.ID, "space")
	}

	// tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("space.deleted", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, nil)
}
