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
		sameNameCount(mock, 0, Data["name"])
		slugCheckMock(mock, Data)

		insertMock(mock)
		SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(resData)
		test.ExpectationsMet(t, mock)

	})

	t.Run("parent category does not exist", func(t *testing.T) {
		test.MockServer()

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns))

		Data["parent_id"] = 1
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		Data["parent_id"] = 0
		test.ExpectationsMet(t, mock)
	})

	t.Run("create category with empty slug", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		test.MockServer()

		sameNameCount(mock, 0, Data["name"])
		slugCheckMock(mock, Data)

		insertMock(mock)

		SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock)
		mock.ExpectCommit()

		Data["slug"] = ""
		res := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object()
		Data["slug"] = "test-category"
		res.ContainsMap(resData)
		test.ExpectationsMet(t, mock)
	})

	t.Run("medium does not belong same space", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		test.MockServer()

		sameNameCount(mock, 0, Data["name"])
		slugCheckMock(mock, Data)

		insertWithMediumError(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("medium does not exist", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		test.MockServer()

		sameNameCount(mock, 0, Data["name"])
		slugCheckMock(mock, Data)

		insertWithMediumError(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("when category with same name exist", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		test.MockServer()

		sameNameCount(mock, 1, Data["name"])

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("cannot parse category description", func(t *testing.T) {
		// test.CheckSpaceMock(mock)
		test.MockServer()

		sameNameCount(mock, 0, Data["name"])

		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"block": "new"}`),
		}
		e.POST(basePath).
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
