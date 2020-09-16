package category

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestCategoryUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid category id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("category_id", "invalid_id").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("category record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.PUT(path).
			WithPath("category_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("Unable to decode category data", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("category_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("Unprocessable category", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("category_id", "1").
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update category", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		sameNameFind(mock, false)

		updateMock(mock)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(Data)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update category with empty slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		slugCheckMock(mock, Data)
		sameNameFind(mock, false)

		updateMock(mock)
		mock.ExpectCommit()

		Data["slug"] = ""
		res := e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().Object()
		Data["slug"] = "test-category"

		res.ContainsMap(Data)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update category with its own parent id", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		Data["parent_id"] = 1
		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		Data["parent_id"] = 0
		test.ExpectationsMet(t, mock)
	})

	t.Run("update category with medium id = 0", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		selectWithSpace(mock)
		sameNameFind(mock, false)

		Data["medium_id"] = 0
		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"categories\" SET (.+)  WHERE (.+) \"categories\".\"id\" = `).
			WithArgs(nil, test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		SelectWithOutSpace(mock)
		mock.ExpectExec(`UPDATE \"categories\" SET (.+)  WHERE (.+) \"categories\".\"id\" = `).
			WithArgs(Data["description"], Data["name"], Data["slug"], test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		SelectWithOutSpace(mock)
		mock.ExpectCommit()

		res := e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().Object()
		res.ContainsMap(Data)
		Data["medium_id"] = 1

		test.ExpectationsMet(t, mock)
	})

	t.Run("updating category fails", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		selectWithSpace(mock)
		sameNameFind(mock, false)

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"categories\" SET (.+)  WHERE (.+) \"categories\".\"id\" = `).
			WithArgs(Data["description"], Data["medium_id"], Data["name"], Data["slug"], test.AnyTime{}, 1).
			WillReturnError(errors.New("cannot update category"))
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("category with same name exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		sameNameFind(mock, true)

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update category when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		selectWithSpace(mock)
		sameNameFind(mock, false)

		updateMock(mock)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})
}
