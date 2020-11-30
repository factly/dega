package post

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestPostPublish(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid post id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(publishPath).
			WithPath("post_id", "invalid_id").
			WithHeaders(headers).
			WithJSON(publishData).
			Expect().
			Status(http.StatusBadRequest)

		test.ExpectationsMet(t, mock)
	})

	t.Run("post record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		recordNotFoundMock(mock)

		e.PUT(publishPath).
			WithPath("post_id", "100").
			WithHeaders(headers).
			WithJSON(publishData).
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("no authors associated with post", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		postSelectWithSpace(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "post_authors"`)).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "post_authors"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, 1, 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		publishMock(mock)
		mock.ExpectCommit()

		e.PUT(publishPath).
			WithPath("post_id", "1").
			WithHeaders(headers).
			WithJSON(publishData).
			Expect().
			Status(http.StatusOK)

		test.ExpectationsMet(t, mock)
	})

	t.Run("publish a post", func(t *testing.T) {
		prePublishMock(mock)
		publishMock(mock)
		mock.ExpectCommit()

		e.PUT(publishPath).
			WithPath("post_id", "1").
			WithHeaders(headers).
			WithJSON(publishData).
			Expect().
			Status(http.StatusOK)

		test.ExpectationsMet(t, mock)
	})

	t.Run("publish a post when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		prePublishMock(mock)
		publishMock(mock)
		mock.ExpectRollback()

		e.PUT(publishPath).
			WithPath("post_id", "1").
			WithHeaders(headers).
			WithJSON(publishData).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})
}
