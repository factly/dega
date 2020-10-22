package rating

import (
	"errors"
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

var updatedRating = map[string]interface{}{
	"name":          "True",
	"description":   "article is validated",
	"numeric_value": 5,
	"medium_id":     uint(1),
}

func TestRatingUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid rating id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("rating_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("rating record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		recordNotFoundMock(mock)

		e.PUT(path).
			WithPath("rating_id", "100").
			WithHeaders(headers).
			WithJSON(updatedRating).
			Expect().
			Status(http.StatusNotFound)
	})
	t.Run("Unable to decode rating data", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("Unprocessable rating", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("update rating", func(t *testing.T) {
		updatedRating["slug"] = "true"
		test.CheckSpaceMock(mock)

		SelectWithSpace(mock)

		ratingUpdateMock(mock, updatedRating, nil)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			WithJSON(updatedRating).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedRating)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update rating by id with empty slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedRating["slug"] = "true"
		SelectWithSpace(mock)

		slugCheckMock(mock, Data)

		ratingUpdateMock(mock, updatedRating, nil)
		mock.ExpectCommit()

		Data["slug"] = ""
		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedRating)
		Data["slug"] = "true"
		test.ExpectationsMet(t, mock)

	})

	t.Run("update rating with medium_id = 0", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectWithSpace(mock)

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"ratings\" SET (.+)  WHERE (.+) \"ratings\".\"id\" = `).
			WithArgs(nil, test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, updatedRating["name"], updatedRating["slug"], updatedRating["medium_id"], updatedRating["description"], updatedRating["numeric_value"], 1))

		mock.ExpectExec(`UPDATE \"ratings\" SET (.+)  WHERE (.+) \"ratings\".\"id\" = `).
			WithArgs(updatedRating["description"], updatedRating["name"], updatedRating["numeric_value"], updatedRating["slug"], test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		SelectWithOutSpace(mock, updatedRating)
		mock.ExpectCommit()

		updatedRating["medium_id"] = 0
		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			WithJSON(updatedRating).
			Expect().
			Status(http.StatusOK)
		updatedRating["medium_id"] = 1
		test.ExpectationsMet(t, mock)
	})

	t.Run("update rating with different slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedRating["slug"] = "true-test"

		SelectWithSpace(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "ratings"`).
			WithArgs(fmt.Sprint(updatedRating["slug"], "%"), 1).
			WillReturnRows(sqlmock.NewRows([]string{"slug", "space_id"}))

		ratingUpdateMock(mock, updatedRating, nil)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			WithJSON(updatedRating).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedRating)
		test.ExpectationsMet(t, mock)

	})

	t.Run("medium not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedRating["slug"] = "true-test"

		SelectWithSpace(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "ratings"`).
			WithArgs(fmt.Sprint(updatedRating["slug"], "%"), 1).
			WillReturnRows(sqlmock.NewRows([]string{"slug", "space_id"}))

		ratingUpdateMock(mock, updatedRating, errors.New("record not found"))
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			WithJSON(updatedRating).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)

	})

	t.Run("rating with same name exist", func(t *testing.T) {
		updatedRating["slug"] = "true"
		updatedRating["name"] = "New Rating"
		test.CheckSpaceMock(mock)

		SelectWithSpace(mock)

		sameNameCount(mock, 1, updatedRating["name"])

		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			WithJSON(updatedRating).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
		updatedRating["name"] = "True"
	})

	t.Run("update rating when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		updatedRating["slug"] = "true"
		test.CheckSpaceMock(mock)

		SelectWithSpace(mock)

		ratingUpdateMock(mock, updatedRating, nil)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			WithJSON(updatedRating).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

}
