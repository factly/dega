package space

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestSpacePermissionCreate(t *testing.T) {

	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable permission", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("Undecodable permission", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("space's permission already exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		e.POST(basePath).
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("create space permission", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "space_permissions"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["fact_check"], Data["space_id"], Data["media"], Data["posts"], Data["podcast"], Data["episodes"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))
		mock.ExpectCommit()

		e.POST(basePath).
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(Data)
		test.ExpectationsMet(t, mock)
	})

	t.Run("creating space permission fails", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "space_permissions"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["fact_check"], Data["space_id"], Data["media"], Data["posts"], Data["podcast"], Data["episodes"]).
			WillReturnError(errors.New("cannot create space permission"))
		mock.ExpectRollback()

		e.POST(basePath).
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})
}
