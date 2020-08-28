package medium

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestMediumDetails(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid medium id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.GET(path).
			WithPath("medium_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("medium record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		recordNotFoundMock(mock)

		e.GET(path).
			WithPath("medium_id", "100").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("get medium by id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectWithSpace(mock)

		e.GET(path).
			WithPath("medium_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(Data)
	})

}
