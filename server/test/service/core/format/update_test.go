package format

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
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

func TestFormatUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid format id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("format_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("format record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		recordNotFoundMock(mock)

		e.PUT(path).
			WithPath("format_id", "100").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})
	t.Run("Unable to decode format data", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		SelectMock(mock, 1, 1)

		e.PUT(path).
			WithPath("format_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unprocessable format", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		SelectMock(mock, 1, 1)
		e.PUT(path).
			WithPath("format_id", 1).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("update format", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedFormat := map[string]interface{}{
			"name":        "Fact Check",
			"slug":        "fact-check",
			"description": "description",
			"meta_fields": postgres.Jsonb{
				RawMessage: []byte(`{"type":"meta fields"}`),
			},
		}

		SelectMock(mock, 1, 1)
		formatUpdateMock(mock, updatedFormat)

		selectAfterUpdate(mock, updatedFormat)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("format_id", 1).
			WithHeaders(headers).
			WithJSON(updatedFormat).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedFormat)

	})

	t.Run("update format by id with empty slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedFormat := map[string]interface{}{
			"name":        "Fact Check",
			"slug":        "fact-check",
			"description": "description",
			"meta_fields": postgres.Jsonb{
				RawMessage: []byte(`{"type":"meta fields"}`),
			},
		}
		SelectMock(mock, 1, 1)
		mock.ExpectQuery(`SELECT slug, space_id FROM "formats"`).
			WithArgs("fact-check%", 1).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, updatedFormat["name"], "factcheck", "", nil))

		formatUpdateMock(mock, updatedFormat)

		selectAfterUpdate(mock, updatedFormat)
		mock.ExpectCommit()

		Data["slug"] = ""
		e.PUT(path).
			WithPath("format_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedFormat)
		Data["slug"] = "fact-check"

		test.ExpectationsMet(t, mock)
	})

	t.Run("update format with different slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedFormat := map[string]interface{}{
			"name":        "Fact Check",
			"slug":        "testing-slug",
			"description": "description",
			"meta_fields": postgres.Jsonb{
				RawMessage: []byte(`{"type":"meta fields"}`),
			},
		}
		SelectMock(mock, 1, 1)
		mock.ExpectQuery(`SELECT slug, space_id FROM "formats"`).
			WithArgs(fmt.Sprint(updatedFormat["slug"], "%"), 1).
			WillReturnRows(sqlmock.NewRows([]string{"slug", "space_id"}))

		formatUpdateMock(mock, updatedFormat)

		selectAfterUpdate(mock, updatedFormat)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("format_id", 1).
			WithHeaders(headers).
			WithJSON(updatedFormat).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedFormat)

	})

	t.Run("format with same name exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedFormat := map[string]interface{}{
			"name":        "Fact Chk",
			"slug":        "fact-check",
			"description": "description",
			"meta_fields": postgres.Jsonb{
				RawMessage: []byte(`{"type":"meta fields"}`),
			},
		}

		SelectMock(mock, 1, 1)
		sameNameCount(mock, 1, updatedFormat["name"])

		e.PUT(path).
			WithPath("format_id", 1).
			WithHeaders(headers).
			WithJSON(updatedFormat).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

}
