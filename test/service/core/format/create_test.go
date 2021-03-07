package format

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test/service/core/permissions/space"
	"github.com/factly/dega-server/util"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestFormatCreate(t *testing.T) {

	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	s := test.RunDefaultNATSServer()
	defer s.Shutdown()
	util.ConnectNats()

	t.Run("Unprocessable format", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unable to decode format", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("create format", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		space.SelectQuery(mock, 1)
		sameNameCount(mock, 0, Data["name"])
		slugCheckMock(mock)

		formatInsertMock(mock)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(Data)
		test.ExpectationsMet(t, mock)
	})

	t.Run("create format with slug is empty", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		space.SelectQuery(mock, 1)
		sameNameCount(mock, 0, Data["name"])
		slugCheckMock(mock)

		formatInsertMock(mock)
		mock.ExpectCommit()

		Data["slug"] = ""
		res := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object()
		Data["slug"] = "fact-check"
		res.ContainsMap(Data)

		test.ExpectationsMet(t, mock)
	})

	t.Run("creating format fails", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		space.SelectQuery(mock, 1)
		sameNameCount(mock, 0, Data["name"])
		slugCheckMock(mock)

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "formats"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["name"], Data["slug"], "", 1).
			WillReturnError(errors.New("cannot create format"))
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("create fact-check when not permitted", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "space_permissions"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "space_id", "fact_check"}))

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("format with same name exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		space.SelectQuery(mock, 1)
		sameNameCount(mock, 1, Data["name"])

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("create format when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		space.SelectQuery(mock, 1)
		sameNameCount(mock, 0, Data["name"])
		slugCheckMock(mock)

		formatInsertMock(mock)
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)

	})
}
