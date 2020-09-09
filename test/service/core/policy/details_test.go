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

func TestDetails(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Get detail success", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		// Splits string of ID to retrieve the name of the policy. The name is in the last index, hence the split
		var id = strings.Split(test.Dummy_SingleMock["id"].(string), ":")

		e.GET(path).
			WithPath("policy_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().Object().Value("name").Equal(id[len(id)-1])

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
