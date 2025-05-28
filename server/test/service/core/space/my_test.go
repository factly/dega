package space

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestSpaceMy(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	config.DB.Exec("DELETE FROM space_settings")
	config.DB.Exec("DELETE FROM spaces")
	config.DB.Exec("DELETE FROM space_permissions")

	e := httpexpect.New(t, testServer.URL)

	// get empty list of spaces
	t.Run("get get my space", func(t *testing.T) {
		e.GET(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Array().
			Element(0).
			Object().
			Value("spaces").
			Array().
			Element(0).
			Object().
			ContainsMap(map[string]interface{}{
				"application_id":  1,
				"description":     "Test",
				"id":              1,
				"name":            "Test",
				"organisation_id": 1,
				"slug":            "test",
				"permissions": []interface{}{
					map[string]interface{}{
						"actions":  []string{"admin"},
						"resource": "admin",
					},
				},
			})
	})

	t.Run("invalid space header", func(t *testing.T) {
		e.GET(basePath).
			WithHeader("X-User", "invalid").
			Expect().
			Status(http.StatusUnauthorized)
	})

	t.Run("when member requests his spaces", func(t *testing.T) {
		gock.New(viper.GetString("kavach_url") + "/organisations/my").
			Persist().
			Reply(http.StatusOK).
			JSON(test.Dummy_Org_Member_List)
		e.GET(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK)
	})
}
