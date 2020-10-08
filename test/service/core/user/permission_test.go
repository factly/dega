package user

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

	t.Run("member requests permissions", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)
		test.CheckSpaceMock(mock)

		gock.New(viper.GetString("keto.url") + "/engines/acp/ory/regex/roles/(.+)").
			Persist().
			Reply(http.StatusNotFound)

		gock.New(viper.GetString("keto.url") + "/engines/acp/ory/regex/policies").
			Persist().
			Reply(http.StatusOK).
			JSON(test.Dummy_KetoPolicy)

		e.GET(permissionPath).
			WithHeaders(headers).
			WithPath("user_id", "1").
			Expect().
			Status(http.StatusUnauthorized)
	})

	t.Run("get logged admin's permissions", func(t *testing.T) {
		test.KetoGock()
		test.CheckSpaceMock(mock)

		e.GET(permissionPath).
			WithHeaders(headers).
			WithPath("user_id", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Array().
			Contains(adminPermissionsResponse)
	})

	t.Run("admin requests member's permissions", func(t *testing.T) {
		test.KetoGock()
		test.CheckSpaceMock(mock)

		e.GET(permissionPath).
			WithHeaders(headers).
			WithPath("user_id", "2").
			Expect().
			Status(http.StatusOK).
			JSON().
			Array().
			Contains(permissionsResponse[0], permissionsResponse[1])
	})

	t.Run("logged in user is admin and cannot get policies", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)
		test.CheckSpaceMock(mock)

		gock.New(viper.GetString("keto.url")).
			Post("/engines/acp/ory/regex/allowed").
			Persist().
			Reply(http.StatusOK)

		gock.New(viper.GetString("keto.url") + "/engines/acp/ory/regex/policies").
			Persist().
			Reply(http.StatusNotFound)

		e.GET(permissionPath).
			WithHeaders(headers).
			WithPath("user_id", "2").
			Expect().
			Status(http.StatusInternalServerError)
	})

	t.Run("when keto is down", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)
		test.CheckSpaceMock(mock)

		e.GET(permissionPath).
			WithHeaders(headers).
			WithPath("user_id", "1").
			Expect().
			Status(http.StatusInternalServerError)

	})

	t.Run("invalid user_id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.GET(permissionPath).
			WithHeaders(headers).
			WithPath("user_id", "abc").
			Expect().
			Status(http.StatusNotFound)

	})
}
