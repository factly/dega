package policy

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/util"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestCreatePolicy(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	s := test.RunDefaultNATSServer()
	defer s.Shutdown()
	util.ConnectNats()

	// Create a policy
	t.Run("Successful create policy", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(policy_test).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).JSON().Object().Value("name").Equal(policy_test["name"])
	})

	t.Run("undecodable policy body", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(undecodable_policy).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(policy_test).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
	})

}
