package tag

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

func TestTagCreate(t *testing.T) {

	mock := test.SetupMockDB()

	// test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable tag", func(t *testing.T) {
		test.MockServer()
		// test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unable to decode tag", func(t *testing.T) {
		test.MockServer()
		// test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("create tag", func(t *testing.T) {
		test.MockServer()
		// test.CheckSpaceMock(mock)

		sameNameCount(mock, 0, Data["name"])

		slugCheckMock(mock)

		tagInsertMock(mock)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(Data)
		test.ExpectationsMet(t, mock)

	})

	t.Run("creating tag fails", func(t *testing.T) {
		test.MockServer()
		// test.CheckSpaceMock(mock)

		sameNameCount(mock, 0, Data["name"])

		slugCheckMock(mock)

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "tags"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["name"], Data["slug"], Data["description"], Data["html_description"], Data["is_featured"], 1).
			WillReturnError(errors.New("cannot create tag"))
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)

	})

	t.Run("tag with same name exist", func(t *testing.T) {
		test.MockServer()

		// test.CheckSpaceMock(mock)

		sameNameCount(mock, 1, Data["name"])

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("create tag with slug is empty", func(t *testing.T) {
		test.MockServer()

		// test.CheckSpaceMock(mock)

		sameNameCount(mock, 0, Data["name"])

		slugCheckMock(mock)

		tagInsertMock(mock)
		mock.ExpectCommit()

		Data["slug"] = ""
		res := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object()
		Data["slug"] = "elections"
		res.ContainsMap(Data)
		test.ExpectationsMet(t, mock)
	})

	t.Run("cannot parse tag description", func(t *testing.T) {
		test.MockServer()

		// test.CheckSpaceMock(mock)

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
