package space

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/newtest"
	"github.com/factly/dega-server/service"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestSettingsCreate(t *testing.T) {

	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	config.DB.Exec("DELETE FROM space_settings")
	config.DB.Exec("DELETE FROM spaces")
	config.DB.Exec("DELETE FROM space_permissions")

	e := httpexpect.New(t, testServer.URL)

	// create space
	t.Run("create space", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(SpaceData).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(newtest.KavachCreateSpace)
	})

	// unprocessable space body
	t.Run("unprocessable space body", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// unable to decode space body
	t.Run("unable to decode space body", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// invlaid user id
	t.Run("invlaid user id", func(t *testing.T) {
		e.POST(basePath).
			WithHeader("X-User", "invalid").
			WithJSON(SpaceData).
			Expect().
			Status(http.StatusUnauthorized)
	})
}
