package format

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func selectAfterUpdate(mock sqlmock.Sqlmock, format map[string]interface{}) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, format["name"], format["slug"]))
}

func TestFormatUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(Routes())
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
			Status(http.StatusNotFound)
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
		formatSelectMock(mock)

		e.PUT(path).
			WithPath("format_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unprocessable format", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		formatSelectMock(mock)

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
			"name": "Elections",
			"slug": "elections",
		}

		formatSelectMock(mock)

		formatUpdateMock(mock, updatedFormat)

		selectAfterUpdate(mock, updatedFormat)

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
			"name": "Elections",
			"slug": "elections-1",
		}
		formatSelectMock(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "formats"`).
			WithArgs("elections%", 1).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, updatedFormat["name"], "elections"))

		formatUpdateMock(mock, updatedFormat)

		selectAfterUpdate(mock, updatedFormat)

		e.PUT(path).
			WithPath("format_id", 1).
			WithHeaders(headers).
			WithJSON(dataWithoutSlug).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedFormat)

	})

	t.Run("update format with different slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedFormat := map[string]interface{}{
			"name": "Elections",
			"slug": "testing-slug",
		}
		formatSelectMock(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "formats"`).
			WithArgs(fmt.Sprint(updatedFormat["slug"], "%"), 1).
			WillReturnRows(sqlmock.NewRows([]string{"slug", "space_id"}))

		formatUpdateMock(mock, updatedFormat)

		selectAfterUpdate(mock, updatedFormat)

		e.PUT(path).
			WithPath("format_id", 1).
			WithHeaders(headers).
			WithJSON(updatedFormat).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedFormat)

	})

}
