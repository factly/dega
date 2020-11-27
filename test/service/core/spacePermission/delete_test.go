package spacePermission

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestSpacePermissionDelete(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid permission id", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.DELETE(path).
			WithPath("permission_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("space permission record does not exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(columns))

		e.DELETE(path).
			WithPath("permission_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("delete space permission", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, 1)

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"space_permissions\"`).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		e.DELETE(path).
			WithPath("permission_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})
}
