package role

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	httpx "github.com/factly/dega-server/util/http"
	"github.com/spf13/viper"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func update(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	spaceID := chi.URLParam(r, "space_id")
	sID, err := strconv.Atoi(spaceID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	orgID, err := util.GetOrganisationIDfromSpaceID(uint(sID), uint(uID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	applicationID, err := util.GetApplicationID(uint(uID), "dega")
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	roleID := chi.URLParam(r, "role_id")
	spaceRole := new(model.SpaceRole)
	err = json.NewDecoder(r.Body).Decode(spaceRole)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	buf := new(bytes.Buffer)
	err = json.NewEncoder(buf).Encode(spaceRole)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	requrl := viper.GetString("kavach_url") + "/organisations/" + fmt.Sprintf("%d", orgID) + "/applications/" + fmt.Sprintf("%d", applicationID) + "/spaces/" + spaceID + "/roles/" + roleID
	req, err := http.NewRequest(http.MethodPut, requrl, buf)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	client := httpx.CustomHttpClient()
	resp, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		loggerx.Error(errors.New("internal server error on kavach server"))
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	result := &model.SpaceRole{}
	err = json.NewDecoder(resp.Body).Decode(result)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	renderx.JSON(w, http.StatusCreated, result)
}
