package category

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/gavv/httpexpect"
	"github.com/jinzhu/gorm/dialects/postgres"
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
		// test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("category_id", "invalid_id").
			WithJSON(newData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
		test.ExpectationsMet(t, mock)
	})

	t.Run("category record not found", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.PUT(path).
			WithPath("category_id", "1").
			WithJSON(newData).
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

		updateMock(mock)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(resData)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update category with empty slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		slugCheckMock(mock, newData)

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

		res.ContainsMap(resData)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update category with parent set", func(t *testing.T) {
		Data["parent_id"] = 2
		test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		selectWithSpace(mock)

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(test.AnyTime{}, Data["is_featured"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(test.AnyTime{}, 1, Data["name"], Data["slug"], Data["description"], Data["html_description"], Data["parent_id"], Data["medium_id"], Data["meta_fields"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		selectWithSpace(mock)
		medium.SelectWithOutSpace(mock)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(resData)
		test.ExpectationsMet(t, mock)
		Data["parent_id"] = 0
	})

	t.Run("parent category not found in space", func(t *testing.T) {
		Data["parent_id"] = 2
		test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
		Data["parent_id"] = 0
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

		Data["medium_id"] = 0
		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(nil, test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(nil, test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(test.AnyTime{}, Data["is_featured"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(test.AnyTime{}, 1, Data["name"], Data["slug"], Data["description"], Data["html_description"], Data["meta_fields"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		selectWithSpace(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
			WithArgs(0).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "type", "title", "description", "caption", "alt_text", "file_size", "url", "dimensions", "space_id"}))

		mock.ExpectCommit()

		res := e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().Object()
		res.ContainsMap(resData)
		Data["medium_id"] = 1

		test.ExpectationsMet(t, mock)
	})

	t.Run("updating category fails", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(nil, test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(test.AnyTime{}, Data["is_featured"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(test.AnyTime{}, 1, Data["name"], Data["slug"], Data["description"], Data["html_description"], Data["medium_id"], Data["meta_fields"], 1).
			WillReturnError(errors.New(`updating category fails`))
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

		Data["name"] = "New Category"
		sameNameCount(mock, 1, Data["name"])

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
		Data["name"] = "Test Category"
	})

	t.Run("cannot parse category description", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"block": "new"}`),
		}
		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
		}
		test.ExpectationsMet(t, mock)
	})

}
