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
	"github.com/factly/dega-server/util"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

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
	s := test.RunDefaultNATSServer()
	defer s.Shutdown()
	util.ConnectNats()

	t.Run("invalid tag id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("tag_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
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
		SelectMock(mock, Data, 1, 1)

		e.PUT(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unprocessable tag", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		SelectMock(mock, Data, 1, 1)

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
			"name":        "Elections",
			"slug":        "elections",
			"is_featured": true,
			"description": postgres.Jsonb{
				RawMessage: []byte(`{"type":"description"}`),
			},
		}

		SelectMock(mock, Data, 1, 1)

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
			"name":        "Elections",
			"slug":        "elections-1",
			"is_featured": true,
			"description": postgres.Jsonb{
				RawMessage: []byte(`{"type":"description"}`),
			},
		}
		SelectMock(mock, Data, 1, 1)

		mock.ExpectQuery(`SELECT slug, space_id FROM "tags"`).
			WithArgs("elections%", 1).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, updatedTag["name"], "elections", "", false, 1))

		tagUpdateMock(mock, updatedTag)
		mock.ExpectCommit()

		Data["slug"] = ""
		e.PUT(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedTag)
		Data["slug"] = "elections"
	})

	t.Run("update tag with different slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedTag := map[string]interface{}{
			"name":        "Elections",
			"slug":        "testing-slug",
			"is_featured": true,
			"description": postgres.Jsonb{
				RawMessage: []byte(`{"type":"description"}`),
			},
		}
		SelectMock(mock, Data, 1, 1)

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

	t.Run("tag with same name exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedTag := map[string]interface{}{
			"name":        "NewElections",
			"slug":        "elections",
			"is_featured": true,
		}

		SelectMock(mock, Data, 1, 1)

		sameNameCount(mock, 1, updatedTag["name"])

		e.PUT(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			WithJSON(updatedTag).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("update tag when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		updatedTag := map[string]interface{}{
			"name":        "Elections",
			"slug":        "elections",
			"is_featured": true,
			"description": postgres.Jsonb{
				RawMessage: []byte(`{"type":"description"}`),
			},
		}

		SelectMock(mock, Data, 1, 1)

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
