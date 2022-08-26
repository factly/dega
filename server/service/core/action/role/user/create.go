package user

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/timex"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

type requestModel struct {
	UserID int `json:"user_id" validate:"required"`
}

func create(w http.ResponseWriter, r *http.Request) {
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
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	orgID, err := util.GetOrganisationIDfromSpaceID(uint(sID), uint(uID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	roleID := chi.URLParam(r, "role_id")

	// decoding the requestBody
	userReqModel := &requestModel{}
	err = json.NewDecoder(r.Body).Decode(userReqModel)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	buf := new(bytes.Buffer)
	err = json.NewEncoder(buf).Encode(userReqModel)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	reqURL := viper.GetString("kavach_url") + fmt.Sprintf("/organisations/%d/applications/%d/spaces/%s/roles/%s/users", orgID, viper.GetInt("dega_application_id"), spaceID, roleID)
	req, err := http.NewRequest(http.MethodPost, reqURL, buf)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	req.Header.Set("X-User", fmt.Sprintf("%d", uID))
	req.Header.Set("Content-type", "application/json")
	client := http.Client{Timeout: time.Minute * time.Duration(timex.HTTP_TIMEOUT)}

	response, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		loggerx.Error(errors.New("internal server error on kavach server"))
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusCreated, nil)
}
