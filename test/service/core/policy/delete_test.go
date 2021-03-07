package policy

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/util"
	"github.com/gavv/httpexpect/v2"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestDelete(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	s := test.RunDefaultNATSServer()
	defer s.Shutdown()
	util.ConnectNats()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Delete success", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.DELETE(path).
			WithPath("policy_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
	})

	t.Run("when keto cannot delete policies", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)
		gock.New(viper.GetString("keto_url")).
			Post("/engines/acp/ory/regex/allowed").
			Persist().
			Reply(http.StatusOK)

		test.CheckSpaceMock(mock)

		e.DELETE(path).
			WithPath("policy_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusServiceUnavailable)
	})

	t.Run("when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		e.DELETE(path).
			WithPath("policy_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
	})

}
