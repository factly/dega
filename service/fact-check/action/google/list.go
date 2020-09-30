package google

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/url"

	"github.com/factly/dega-server/config"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total    int           `json:"total"`
	Nodes    []interface{} `json:"nodes"`
	NextPage string        `json:"nextPage"`
}

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

	// googleapis for factchecks
	googleURL := "https://factchecktools.googleapis.com/v1alpha1/claims:search"

	if query == "" {
		loggerx.Error(errors.New("query can't be empty"))
		errorx.Render(w, errorx.Parser(errorx.Message{Message: "query can't be empty",
			Code: http.StatusUnprocessableEntity}))
		return
	}

	var factChecks map[string]interface{}

	req, err := http.NewRequest("GET", googleURL, nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	q := url.Values{}
	q.Add("key", config.GoogleKey)
	q.Add("query", query)
	if language != "" {
		q.Add("languageCode", language)
	}
	if pageToken != "" {
		q.Add("pageToken", pageToken)
	}

	req.URL.RawQuery = q.Encode()

	client := &http.Client{}
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

	result := paging{}
	result.Nodes = make([]interface{}, 0)

	if claims, found := factChecks["claims"]; found {
		result.Nodes = (claims).([]interface{})
		result.Total = len(result.Nodes)
	}

	if nextPageToken, found := factChecks["nextPageToken"]; found {
		result.NextPage = nextPageToken.(string)
	}

	renderx.JSON(w, http.StatusOK, result)
}
