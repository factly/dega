package rating

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

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

		ratingSelectWithSpace(mock)

		ratingUpdateMock(mock, updatedRating, nil)

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
		ratingSelectWithSpace(mock)

		slugCheckMock(mock, Rating)

		ratingUpdateMock(mock, updatedRating, nil)

		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			WithJSON(dataWithoutSlug).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedRating)
		test.ExpectationsMet(t, mock)

	})

	t.Run("update rating with different slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedRating["slug"] = "true-test"

		ratingSelectWithSpace(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "ratings"`).
			WithArgs(fmt.Sprint(updatedRating["slug"], "%"), 1).
			WillReturnRows(sqlmock.NewRows([]string{"slug", "space_id"}))

		ratingUpdateMock(mock, updatedRating, nil)

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

		ratingSelectWithSpace(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "ratings"`).
			WithArgs(fmt.Sprint(updatedRating["slug"], "%"), 1).
			WillReturnRows(sqlmock.NewRows([]string{"slug", "space_id"}))

		ratingUpdateMock(mock, updatedRating, errors.New("record not found"))

		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			WithJSON(updatedRating).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)

	})

}
