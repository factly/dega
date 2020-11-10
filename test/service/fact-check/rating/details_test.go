package rating

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/core/organisationPermission"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestRatingDetails(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid rating id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		organisationPermission.SelectQuery(mock, 1)
		e.GET(path).
			WithPath("rating_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("rating record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		organisationPermission.SelectQuery(mock, 1)
		recordNotFoundMock(mock)

		e.GET(path).
			WithPath("rating_id", "100").
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
	})

	t.Run("get rating by id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		organisationPermission.SelectQuery(mock, 1)
		SelectWithSpace(mock)
		medium.SelectWithOutSpace(mock)

		e.GET(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(resData)
	})

}
