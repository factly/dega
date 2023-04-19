package google

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/url"

	"github.com/factly/dega-server/service/fact-check/service"
	httpx "github.com/factly/dega-server/util/http"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/spf13/viper"
)

// googleapis for factchecks
var GoogleURL = "https://factchecktools.googleapis.com/v1alpha1/claims:search"

// list - Get all google fact checks
// @Summary Show all google fact checks
// @Description Get all google fact checks
// @Tags Claimant
// @ID get-all-google-fact-checks
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param query query string false "Query"
// @Param pageToken query string false "Page Token"
// @Param language query string false "language code"
// @Param sort query string false "Sort"
// @Success 200 {object} paging
// @Router /fact-check/google [get]
func list(w http.ResponseWriter, r *http.Request) {

	query := r.URL.Query().Get("query")
	language := r.URL.Query().Get("language")
	pageToken := r.URL.Query().Get("pageToken")

	if query == "" {
		loggerx.Error(errors.New("query can't be empty"))
		errorx.Render(w, errorx.Parser(errorx.Message{Message: "query can't be empty",
			Code: http.StatusUnprocessableEntity}))
		return
	}

	var factChecks map[string]interface{}

	req, err := http.NewRequest("GET", GoogleURL, nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	q := url.Values{}
	q.Add("key", viper.GetString("google_key"))
	q.Add("query", query)
	if language != "" {
		q.Add("languageCode", language)
	}
	if pageToken != "" {
		q.Add("pageToken", pageToken)
	}

	req.URL.RawQuery = q.Encode()
	client := httpx.CustomHttpClient()
	resp, err := client.Do(req)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	err = json.Unmarshal(body, &factChecks)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	result := service.GetGoogleService().List(factChecks)

	renderx.JSON(w, http.StatusOK, result)
}
