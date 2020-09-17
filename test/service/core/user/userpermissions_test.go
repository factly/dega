package user

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestListUsersPermission(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get logged in user's permissions", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)
		test.CheckSpaceMock(mock)

		gock.New(config.KetoURL + "/engines/acp/ory/regex/roles/(.+)").
			Persist().
			Reply(http.StatusNotFound)

		gock.New(config.KetoURL + "/engines/acp/ory/regex/policies").
			Persist().
			Reply(http.StatusOK).
			JSON(test.Dummy_KetoPolicy)

		headers["X-User"] = "2"

		e.GET(permissionPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Array().
			Contains(permissionsResponse[0], permissionsResponse[1])

		headers["X-User"] = "1"
	})

	t.Run("get logged admin's permissions", func(t *testing.T) {
		test.KetoGock()
		test.CheckSpaceMock(mock)

		e.GET(permissionPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Array().
			Contains(adminPermissionsResponse)
	})

	t.Run("when keto is down", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)
		test.CheckSpaceMock(mock)

		headers["X-User"] = "2"

		e.GET(permissionPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusServiceUnavailable)

		headers["X-User"] = "1"
	})
}
