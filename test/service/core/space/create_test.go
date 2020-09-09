package space

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
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
		slugCheckMock(mock, Data)

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
		slugCheckMock(mock, Data)

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "spaces"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], Data["organisation_id"]).
			WillReturnError(errors.New("cannot create space"))
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

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

	t.Run("When kavach is down", func(t *testing.T) {
		gock.Off()
		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusServiceUnavailable)
	})

	t.Run("create a space when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		slugCheckMock(mock, Data)

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
