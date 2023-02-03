package category

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/gavv/httpexpect"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

func TestCategoryCreate(t *testing.T) {

	mock := test.SetupMockDB()

	// test.MockServer()
	// test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable category", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		test.MockServer()

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

		// test.ExpectationsMet(t, mock)
	})

	t.Run("Unable to decode category", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		test.MockServer()

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		// test.ExpectationsMet(t, mock)
	})

	t.Run("create category without parent", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		mock := test.SetupMockDB()
		sameNameCount(mock, 0, newData.Name)
		slugCheckMock(mock, newData)
		insertMock(mock)
		SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock, *newData)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(newResData)
		test.ExpectationsMet(t, mock)

	})

	t.Run("parent category does not exist", func(t *testing.T) {
		test.MockServer()

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns))
		var parent_id_test uint = 1
		var parent_id_act uint = 0
		newData.ParentID = &parent_id_test
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		newData.ParentID = &parent_id_act
		test.ExpectationsMet(t, mock)
	})

	t.Run("create category with empty slug", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		test.MockServer()

		sameNameCount(mock, 0, newData.Name)
		slugCheckMock(mock, newData)

		insertMock(mock)

		SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock, *newData)
		mock.ExpectCommit()

		newData.Slug = ""
		res := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusCreated).JSON().Object()
		newData.Slug = "test-category"
		res.ContainsMap(newResData)
		test.ExpectationsMet(t, mock)
	})

	t.Run("medium does not belong same space", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		test.MockServer()

		sameNameCount(mock, 0, newData.Name)
		slugCheckMock(mock, newData)

		insertWithMediumError(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("medium does not exist", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		test.MockServer()

		sameNameCount(mock, 0, newData.Name)
		slugCheckMock(mock, newData)

		insertWithMediumError(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("when category with same name exist", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		test.MockServer()

		sameNameCount(mock, 1, newData.Name)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(newData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("cannot parse category description", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		test.MockServer()

		sameNameCount(mock, 1, newData.Name)

		newData.Description = postgres.Jsonb{
			RawMessage: []byte(`{"block": "new"}`),
		}
		e.POST(basePath).
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
