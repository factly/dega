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
	"github.com/factly/dega-server/test/service/core/permissions/space"
	"github.com/factly/dega-server/util"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

var updatedRating = map[string]interface{}{
	"name": "True",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"type":"description"}`),
	},
	"colour": postgres.Jsonb{
		RawMessage: []byte(`"green"`),
	},
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

	s := test.RunDefaultNATSServer()
	defer s.Shutdown()
	util.ConnectNats()

	t.Run("invalid rating id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		e.PUT(path).
			WithPath("rating_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("rating record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
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
		space.SelectQuery(mock, 1)

		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("Unprocessable rating", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

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
		space.SelectQuery(mock, 1)

		SelectWithSpace(mock)

		ratingUpdateMock(mock, updatedRating, nil)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			WithJSON(updatedRating).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(resData)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update rating by id with empty slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
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
			Status(http.StatusOK).JSON().Object().ContainsMap(resData)
		Data["slug"] = "true"
		test.ExpectationsMet(t, mock)

	})

	t.Run("update rating with different slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
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
			Status(http.StatusOK).JSON().Object().ContainsMap(resData)
		test.ExpectationsMet(t, mock)

	})

	t.Run("medium not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
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
		space.SelectQuery(mock, 1)

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

	t.Run("rating with same numeric value exist", func(t *testing.T) {
		updatedRating["slug"] = "true"
		updatedRating["numeric_value"] = 3
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectWithSpace(mock)

		ratingCountQuery(mock, 1)

		e.PUT(path).
			WithPath("rating_id", 1).
			WithHeaders(headers).
			WithJSON(updatedRating).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
		updatedRating["numeric_value"] = 5
	})

	t.Run("update rating when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		updatedRating["slug"] = "true"
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

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
