package category

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

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
		// mock.ExpectQuery(selectQuery).
		// 	WithArgs(1, 1).
		// WillReturnRows(sqlmock.NewRows(Columns))

		e.PUT(path).
			WithPath("category_id", "1").
			WithJSON(newData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("Unable to decode category data", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("category_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("Unprocessable category", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("category_id", "1").
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update category", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		updateMock(mock)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(newResData)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update category with empty slug", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		slugCheckMock(mock, newData)

		updateMock(mock)
		mock.ExpectCommit()

		newData.Slug = ""
		res := e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusOK).JSON().Object()
		newData.Slug = "test-category"

		res.ContainsMap(newResData)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update category with parent set", func(t *testing.T) {
		TestParentID = 1
		// test.CheckSpaceMock(mock)

		// selectWithSpace(mock)

		selectWithSpace(mock)

		mock.ExpectBegin()
		// medium.SelectWithSpace(mock)
		// mock.ExpectExec(`UPDATE \"categories\"`).
		// 	WithArgs(test.AnyTime{}, Data["is_featured"], 1).
		// 	WillReturnResult(sqlmock.NewResult(1, 1))
		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(newData.BackgroundColour, test.AnyTime{}, TestDescriptionJson, TestDescriptionHtml, newData.FooterCode, newData.HeaderCode,
				newData.IsFeatured, newData.MediumID, newData.Meta, newData.MetaFields, newData.Name, nil, newData.Slug, test.AnyTime{}, 1, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectQuery(selectQuery).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, newData.Name, newData.Slug, TestDescriptionJson, TestDescriptionHtml, newData.BackgroundColour, newData.ParentID, newData.MetaFields, newData.MediumID, newData.IsFeatured, 1, newData.Meta, newData.HeaderCode, newData.FooterCode))

		medium.SelectWithOutSpace(mock)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(newResData)
		test.ExpectationsMet(t, mock)

		TestParentID = 0
	})

	t.Run("parent category not found in space", func(t *testing.T) {
		TestParentID = 2
		mock.ExpectQuery(selectQuery).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
		TestParentID = 0
	})

	t.Run("update category with its own parent id", func(t *testing.T) {
		selectWithSpace(mock)
		TestParentID = 1
		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		TestParentID = 0
		test.ExpectationsMet(t, mock)
	})

	t.Run("update category with medium id = 0", func(t *testing.T) {
		selectWithSpace(mock)
		TestMediumId = 0
		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(newData.BackgroundColour, test.AnyTime{}, TestDescriptionJson, TestDescriptionHtml, newData.FooterCode, newData.HeaderCode,
				newData.IsFeatured, nil, newData.Meta, newData.MetaFields, newData.Name, nil, newData.Slug, test.AnyTime{}, 1, 1).
			WillReturnError(errors.New(`updating category fails`))
		medium.SelectWithOutSpace(mock)
		mock.ExpectCommit()
		res := e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusOK).JSON().Object()
		res.ContainsMap(resData)
		TestMediumId = 1

		test.ExpectationsMet(t, mock)
	})

	t.Run("updating category fails", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		mock.ExpectBegin()

		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(newData.BackgroundColour, test.AnyTime{}, TestDescriptionJson, TestDescriptionHtml, newData.FooterCode, newData.HeaderCode,
				newData.IsFeatured, newData.MediumID, newData.Meta, newData.MetaFields, newData.Name, nil, newData.Slug, test.AnyTime{}, 1, 1).
			WillReturnError(errors.New(`updating category fails`))
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("category with same name exist", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		newData.Name = "New Category"
		sameNameCount(mock, 1, newData.Name)

		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
		newData.Name = "Test Category"
	})

	t.Run("cannot parse category description", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		selectWithSpace(mock)

		newData.Description = postgres.Jsonb{
			RawMessage: []byte(`{"block": "new"}`),
		}
		mock.ExpectBegin()
		e.PUT(path).
			WithPath("category_id", 1).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		newData.Description = postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
		}
		test.ExpectationsMet(t, mock)
	})

}
