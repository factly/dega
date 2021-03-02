package google

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service/fact-check/action/google"
	"github.com/factly/dega-server/test/service/core/permissions/space"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestGoogleList(t *testing.T) {
	mock := test.SetupMockDB()
	test.GoogleFactCheckGock()
	test.KavachGock()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	headers := map[string]string{
		"X-User":  "1",
		"X-Space": "1",
	}
	path := "/fact-check/google"

	t.Run("get list of google factchecks", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

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
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		e.GET(path).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"language": "en",
			}).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("get list of google factchecks with pageToken query param", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

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

	t.Run("when google server is down", func(t *testing.T) {
		gock.Off()
		test.KavachGock()
		gock.New(testServer.URL).EnableNetworking().Persist()
		defer gock.DisableNetworking()

		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		e.GET(path).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"query":    "modi",
				"language": "en",
			}).
			Expect().
			Status(http.StatusServiceUnavailable)
	})

	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()

	t.Run("when google returns empty result", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		gock.New(google.GoogleURL).
			Reply(http.StatusOK).
			JSON(map[string]interface{}{})

		e.GET(path).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"query":    "modi",
				"language": "en",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})
	})
}
