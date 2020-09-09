package policy

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("List success", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		// Splits string of ID to retrieve the name of the policy. The name is in the last index, hence the split
		var text = strings.Split(test.Dummy_KetoPolicy[1]["id"].(string), ":")

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().Object().Value("nodes").Array().Element(0).Object().Value("name").Equal(text[len(text)-1])
	})

	t.Run("when keto cannot fetch policies", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)
		gock.New(config.KetoURL).
			Post("/engines/acp/ory/regex/allowed").
			Persist().
			Reply(http.StatusOK)

		test.CheckSpaceMock(mock)

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusServiceUnavailable)
	})

}
