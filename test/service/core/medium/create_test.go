package medium

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test/service/core/permissions/spacePermission"
	"github.com/factly/dega-server/util"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestMediumCreate(t *testing.T) {

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

	t.Run("Unprocessable medium", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		spacePermission.SelectQuery(mock)
		countQuery(mock, 1)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unable to decode medium", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("create medium", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		spacePermission.SelectQuery(mock)
		countQuery(mock, 0)

		slugCheckMock(mock, Data)

		mediumInsertMock(mock)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(createArr).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			Value("nodes").
			Array().
			Element(0).Object().ContainsMap(Data)
		test.ExpectationsMet(t, mock)

	})

	t.Run("create medium when permission not present", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "space_permissions"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "space_id", "mediums", "posts"}))

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(createArr).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("create more than permitted medium", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		spacePermission.SelectQuery(mock, 1)
		countQuery(mock, 100)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(createArr).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("create medium with empty slug", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		spacePermission.SelectQuery(mock, 1)
		countQuery(mock, 0)

		slugCheckMock(mock, Data)

		mediumInsertMock(mock)
		mock.ExpectCommit()

		Data["slug"] = ""
		res := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(createArr).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			Value("nodes").Array().Element(0).Object()
		Data["slug"] = "image"
		res.ContainsMap(Data)
		test.ExpectationsMet(t, mock)
	})

	t.Run("medium does not belong same space", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)
		countQuery(mock, 0)

		slugCheckMock(mock, Data)
		mediumInsertError(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(createArr).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("create medium when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)
		countQuery(mock, 0)

		slugCheckMock(mock, Data)

		mediumInsertMock(mock)
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(createArr).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})
}
