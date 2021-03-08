package menu

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestMenuUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid menu id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("menu_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
		test.ExpectationsMet(t, mock)
	})

	t.Run("undecodable menu", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("menu_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid menu data", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("menu_id", "1").
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("menu record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.PUT(path).
			WithPath("menu_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("menu with same name exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, 1, 1)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "menus"`)).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		Data["name"] = "test"
		e.PUT(path).
			WithPath("menu_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
		Data["name"] = "Elections"
	})

	t.Run("updated menu", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, 1, 1)

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"menus\"`).
			WithArgs(test.AnyTime{}, 1, Data["name"], Data["slug"], Data["menu"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		SelectQuery(mock, 1, 1)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("menu_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})

	t.Run("meili server fails", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		SelectQuery(mock, 1, 1)

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"menus\"`).
			WithArgs(test.AnyTime{}, 1, Data["name"], Data["slug"], Data["menu"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		SelectQuery(mock, 1, 1)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("menu_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

}
