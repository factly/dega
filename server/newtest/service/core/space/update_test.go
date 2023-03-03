package space

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestSpaceUpdatae(t *testing.T) {

	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	config.DB.Exec("DELETE FROM space_settings")
	config.DB.Exec("DELETE FROM spaces")
	config.DB.Exec("DELETE FROM space_permissions")

	e := httpexpect.New(t, testServer.URL)

	t.Run("update space", func(t *testing.T) {
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(SpaceData).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{
				"name":            "Test",
				"slug":            "test",
				"description":     "Test",
				"id":              1,
				"organisation_id": 1,
				"application_id":  1,
			})
	})

	t.Run("invalid space id", func(t *testing.T) {
		e.PUT(path).
			WithPath("space_id", "invalid").
			WithHeader("X-User", "1").
			WithJSON(SpaceData).
			Expect().
			Status(http.StatusBadRequest)
	})

	// unprocessable space body
	t.Run("unprocessable space body", func(t *testing.T) {
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// space record not found
	t.Run("space record not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("space_id", "999").
			WithHeader("X-User", "1").
			WithJSON(SpaceData).
			Expect().
			Status(http.StatusInternalServerError)
	})

	t.Run("update space when mobile_icon_id = 0", func(t *testing.T) {
		SpaceData["mobile_icon_id"] = 0
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(SpaceData).
			Expect().
			Status(http.StatusOK)
		SpaceData["mobile_icon_id"] = 1
	})
	t.Run("update space when fav_icon_id = 0", func(t *testing.T) {
		SpaceData["fav_icon_id"] = 0
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(SpaceData).
			Expect().
			Status(http.StatusOK)
		SpaceData["fav_icon_id"] = 1
	})

	t.Run("update space when logo_mobile_id = 0", func(t *testing.T) {
		SpaceData["logo_mobile_id"] = 0
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(SpaceData).
			Expect().
			Status(http.StatusOK)
		SpaceData["logo_mobile_id"] = 1
	})
	t.Run("update space when logo_id = 0", func(t *testing.T) {
		SpaceData["logo_id"] = 0
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(SpaceData).
			Expect().
			Status(http.StatusOK)
		SpaceData["logo_id"] = 1
	})
}
