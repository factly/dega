package author

import (
	"net/http"
	"net/http/httptest"
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

	t.Run("test list.go", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		// Extracts "nodes" from the response, which contains the real data that we sent in array format.
		// Checking only if the email value is equal since the data sent and data retrieved is different cause list.go manipulates it,
		// so direct comparison of the objects (sent & received) is futile.
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("nodes").
			Array().
			Element(0).
			Object().
			Value("email").
			Equal(test.Dummy_AuthorList[0]["email"])
	})

	// Header missing space. This results in Unauthorization.
	t.Run("Missing space for list", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.GET(basePath).
			WithHeaders(missingSpace).
			Expect().
			Status(http.StatusUnauthorized)
	})

	// Header missing User ID. This results in Unauthorization.
	t.Run("Missing user for list", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.GET(basePath).
			WithHeaders(missingUser).
			Expect().
			Status(http.StatusUnauthorized)
	})
}
