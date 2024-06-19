package space

import (
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestSpaceDelete(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	config.DB.Exec("DELETE FROM space_settings")
	config.DB.Exec("DELETE FROM spaces")
	config.DB.Exec("DELETE FROM space_permissions")

	e := httpexpect.New(t, testServer.URL)

	// delete space
	t.Run("delete space", func(t *testing.T) {
		e.DELETE(path).
			WithPath("space_id", "1").
			WithHeaders(headers).
			Expect().
			Status(200)
	})

	// invalid space id
	t.Run("invalid space id", func(t *testing.T) {
		e.DELETE(path).
			WithPath("space_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(400)
	})

}
