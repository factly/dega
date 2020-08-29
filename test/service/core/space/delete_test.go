package space

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

func TestSpaceDelete(t *testing.T) {
	mock := test.SetupMockDB()

	defer gock.Disable()
	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("delete a space", func(t *testing.T) {
		SelectQuery(mock)

		mock.ExpectBegin()
		mock.ExpectExec(deleteQuery).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		e.DELETE(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})

	t.Run("space record not found", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.DELETE(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid space id", func(t *testing.T) {
		e.DELETE(path).
			WithPath("space_id", "invalid").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("when kavach is down", func(t *testing.T) {
		gock.Off()
		SelectQuery(mock)

		e.DELETE(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusServiceUnavailable)

		test.ExpectationsMet(t, mock)
	})
}
