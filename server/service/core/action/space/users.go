package space

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/x/middlewarex"
	"github.com/spf13/viper"

	//	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"

	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func users(w http.ResponseWriter, r *http.Request) {
	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	orgID := r.URL.Query().Get("organisation_id")
	spaceID := chi.URLParam(r, "space_id")
	req, err := http.NewRequest("GET", viper.GetString("kavach_url")+"/organisations/"+orgID+"/applications/"+viper.GetString("dega_application_id")+"/spaces/"+spaceID+"/users", nil)
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
	result := []model.User{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		loggerx.Error(err)
		return
	}

	renderx.JSON(w, http.StatusOK, result)

}
