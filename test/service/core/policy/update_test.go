package policy

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Update Success", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("policy_id", 1).
			WithJSON(policy_test).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().Object().Value("id").Equal(policy_test["name"])
	})

	t.Run("Invalid Header", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("policy_id", 1).
			WithJSON(policy_test).
			WithHeaders(invalidHeader).
			Expect().
			Status(http.StatusUnauthorized)
	})

}
