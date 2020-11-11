package meta

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestMetaDetails(t *testing.T) {
	mock := test.SetupMockDB()

	test.IFramelyGock()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get iframely metadata for github.com", func(t *testing.T) {
		e.GET(path).
			WithQueryObject(map[string]interface{}{
				"url":  siteUrl,
				"type": "iframely",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object()
	})

	t.Run("get oembed metadata for github.com", func(t *testing.T) {
		e.GET(path).
			WithQueryObject(map[string]interface{}{
				"url":  siteUrl,
				"type": "oembed",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object()
	})

	t.Run("get link metadata for github.com", func(t *testing.T) {
		res := e.GET(path).
			WithQueryObject(map[string]interface{}{
				"url":  siteUrl,
				"type": "link",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object()

		res.Value("success").Number().Equal(1)
		res.Value("meta").Object().ContainsMap(linkmeta["meta"])
	})

	t.Run("request metadata without url", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.GET(path).
			WithQueryObject(map[string]interface{}{
				"type": "iframely",
			}).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("request metadata without type", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.GET(path).
			WithQueryObject(map[string]interface{}{
				"url": siteUrl,
			}).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("iframely is down", func(t *testing.T) {
		gock.Off()
		test.CheckSpaceMock(mock)
		e.GET(path).
			WithQueryObject(map[string]interface{}{
				"url":  siteUrl,
				"type": "iframely",
			}).
			Expect().
			Status(http.StatusInternalServerError)
	})

	t.Run("iframely is timed out", func(t *testing.T) {
		gock.Off()
		gock.New(testServer.URL).EnableNetworking().Persist()
		defer gock.DisableNetworking()

		gock.New(viper.GetString("iframely_url")).
			Get("/iframely").
			ParamPresent("url").
			Persist().
			Reply(http.StatusRequestTimeout)

		e.GET(path).
			WithQueryObject(map[string]interface{}{
				"url":  siteUrl,
				"type": "iframely",
			}).
			Expect().
			Status(http.StatusInternalServerError)
	})
}
