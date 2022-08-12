package role

import (
	"bytes"
	"errors"
	"fmt"

	//"context"
	"encoding/json"

	//	"fmt"
	"net/http"
	"strconv"

	"github.com/spf13/viper"

	//"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	//"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"

	//"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"

	//"github.com/factly/x/slugx"
	"github.com/go-chi/chi"
)

func createUserRole(w http.ResponseWriter, r *http.Request) {
	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	spaceID := chi.URLParam(r, "space_id")
	roleID := chi.URLParam(r, "role_id")
	reqBody := map[string]interface{}{}
	err = json.NewDecoder(r.Body).Decode(&reqBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	//fmt.Println(reqBody, "reqBody")
	orgID := uint(reqBody["organisation_id"].(float64))

	// if !ok {
	// 	loggerx.Error(errors.New("organisation id is not defined"))
	// 	errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
	// 	return
	// }
	user, ok := reqBody["user"].(map[string]interface{})
	if !ok {
		loggerx.Error(errors.New("request body is empty"))
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	buf := new(bytes.Buffer)
	err = json.NewEncoder(buf).Encode(&user)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	//**need to get util func from x-package for org id
	requrl := viper.GetString("kavach_url") + "/organisations/" + fmt.Sprintf("%d", orgID) + "/applications/" + viper.GetString("dega_application_id") + "/spaces/" + spaceID + "/roles/" + roleID + "/users"
	fmt.Println(requrl, "requrl")
	req, err := http.NewRequest("POST", requrl, buf)
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
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
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
