package space

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/organisationPermission"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestSpaceCreate(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("create a space", func(t *testing.T) {
		insertMock(mock)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated)

		test.ExpectationsMet(t, mock)
	})

	t.Run("creating space fails", func(t *testing.T) {
		organisationPermission.SelectQuery(mock, 1)

		mock.ExpectQuery(countQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		slugCheckMock(mock)
		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "spaces"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], Data["organisation_id"]).
			WillReturnError(errors.New("cannot create space"))
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("creating space permission fails", func(t *testing.T) {
		organisationPermission.SelectQuery(mock, 1)

		mock.ExpectQuery(countQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		slugCheckMock(mock)
		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "spaces"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], Data["organisation_id"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"fav_icon_id", "mobile_icon_id", "logo_id", "logo_mobile_id", "id"}).
				AddRow(1, 1, 1, 1, 1))

		mock.ExpectQuery(`INSERT INTO "space_permissions"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, true, 1).
			WillReturnError(errors.New("cannot create space permission"))

		mock.ExpectRollback()

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("create space when no permission found", func(t *testing.T) {
		Data["organisation_id"] = 2

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_permissions"`)).
			WithArgs(2).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "organisation_id", "spaces", "mediums", "posts"}))

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		Data["organisation_id"] = 1
		test.ExpectationsMet(t, mock)
	})

	t.Run("create more than allowed spaces", func(t *testing.T) {

		organisationPermission.SelectQuery(mock, 1)

		mock.ExpectQuery(countQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(10))

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)

		test.ExpectationsMet(t, mock)
	})

	t.Run("Unprocessable space body", func(t *testing.T) {
		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("unable to decode space body", func(t *testing.T) {
		e.POST(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("invalid user id", func(t *testing.T) {
		e.POST(basePath).
			WithHeader("X-User", "invalid_id").
			WithJSON(Data).
			Expect().
			Status(http.StatusUnauthorized)
	})

	t.Run("When keto is down", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)
		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusUnauthorized)
	})

	t.Run("create a space when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		insertMock(mock)
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})
}
