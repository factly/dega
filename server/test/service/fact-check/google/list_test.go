package google

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestGoogleList(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	test.GoogleFactCheckGock()
	//delete all entries from the db and insert some data

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	headers := map[string]string{
		"X-User":  "1",
		"X-Space": "1",
	}
	path := "/fact-check/google"

	t.Run("get list of google factchecks", func(t *testing.T) {

		e.GET(path).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"query":    "modi",
				"language": "en",
			}).
			Expect().
			Status(http.StatusOK)
	})

	t.Run("get google factcheck without query", func(t *testing.T) {

		e.GET(path).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"language": "en",
			}).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("get list of google factchecks with pageToken query param", func(t *testing.T) {

		e.GET(path).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"query":     "modi",
				"language":  "en",
				"pageToken": "abc",
			}).
			Expect().
			Status(http.StatusOK)
	})

}
