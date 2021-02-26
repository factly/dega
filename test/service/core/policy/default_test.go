package policy

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service/core/action/policy"
	"github.com/factly/dega-server/util"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestCreateDefaultPolicy(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	policy.DataFile = "../../../../data/formats.json"

	s := test.RunDefaultNATSServer()
	defer s.Shutdown()
	util.ConnectNats()

	// Create a policy
	t.Run("create default policies", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			Value("nodes").
			Array()
		test.ExpectationsMet(t, mock)
	})

	t.Run("when cannot open data file", func(t *testing.T) {
		policy.DataFile = "nofile.json"
		test.CheckSpaceMock(mock)

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		policy.DataFile = "../../../../data/policies.json"
	})

	t.Run("when cannot parse data file", func(t *testing.T) {
		policy.DataFile = "invalidData.json"
		test.CheckSpaceMock(mock)

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		policy.DataFile = "../../../../data/policies.json"
	})

	t.Run("when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})
}
