package spacePermission

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/test/service/core/space"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestSpacePermissionDetails(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("permission record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(columns))

		e.GET(path).
			WithPath("permission_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid permissions id", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.GET(path).
			WithPath("permission_id", "invalid").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)

	})

	t.Run("fetch permission details", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, 1)

		space.SelectQuery(mock, 1)

		e.GET(path).
			WithPath("permission_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})
}
