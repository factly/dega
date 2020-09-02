package tag

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func selectAfterUpdate(mock sqlmock.Sqlmock, tag map[string]interface{}) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, tag["name"], tag["slug"]))
}

func TestTagUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid tag id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("tag_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("tag record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		recordNotFoundMock(mock)

		e.PUT(path).
			WithPath("tag_id", "100").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})
	t.Run("Unable to decode tag data", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		tagSelectMock(mock)

		e.PUT(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unprocessable tag", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		tagSelectMock(mock)

		e.PUT(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("update tag", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedTag := map[string]interface{}{
			"name": "Elections",
			"slug": "elections",
		}

		tagSelectMock(mock)

		tagUpdateMock(mock, updatedTag)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			WithJSON(updatedTag).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedTag)

	})

	t.Run("update tag by id with empty slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedTag := map[string]interface{}{
			"name": "Elections",
			"slug": "elections-1",
		}
		tagSelectMock(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "tags"`).
			WithArgs("elections%", 1).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, updatedTag["name"], "elections"))

		tagUpdateMock(mock, updatedTag)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			WithJSON(dataWithoutSlug).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedTag)

	})

	t.Run("update tag with different slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedTag := map[string]interface{}{
			"name": "Elections",
			"slug": "testing-slug",
		}
		tagSelectMock(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "tags"`).
			WithArgs(fmt.Sprint(updatedTag["slug"], "%"), 1).
			WillReturnRows(sqlmock.NewRows([]string{"slug", "space_id"}))

		tagUpdateMock(mock, updatedTag)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			WithJSON(updatedTag).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedTag)

	})

	t.Run("update tag when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		updatedTag := map[string]interface{}{
			"name": "Elections",
			"slug": "elections",
		}

		tagSelectMock(mock)

		tagUpdateMock(mock, updatedTag)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			WithJSON(updatedTag).
			Expect().
			Status(http.StatusInternalServerError)
	})
}
