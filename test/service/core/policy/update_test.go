package policy

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
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

	t.Run("keto cannot delete old policy", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)
		gock.New(config.KetoURL).
			Post("/engines/acp/ory/regex/allowed").
			Persist().
			Reply(http.StatusOK)

		e.PUT(path).
			WithPath("policy_id", 1).
			WithJSON(policy_test).
			WithHeaders(headers).
			Expect().
			Status(http.StatusServiceUnavailable)
	})

	t.Run("when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("policy_id", 1).
			WithJSON(policy_test).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
	})

}
