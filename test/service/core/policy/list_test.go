package policy

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestList(t *testing.T) {
	mock := test.SetupMockDB()

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
}
