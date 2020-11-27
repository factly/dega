package rating

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/spacePermission"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestRatingCreate(t *testing.T) {

	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable rating", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unable to decode rating", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("create rating", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		sameNameCount(mock, 0, Data["name"])
		ratingCountQuery(mock, 0)
		slugCheckMock(mock, Data)

		ratingInsertMock(mock)
		SelectWithOutSpace(mock, Data)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(resData)
		test.ExpectationsMet(t, mock)

	})

	t.Run("create rating with slug is empty", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		sameNameCount(mock, 0, Data["name"])
		ratingCountQuery(mock, 0)
		slugCheckMock(mock, Data)

		ratingInsertMock(mock)

		SelectWithOutSpace(mock, Data)
		mock.ExpectCommit()

		Data["slug"] = ""
		res := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object()
		Data["slug"] = "true"
		res.ContainsMap(resData)

		test.ExpectationsMet(t, mock)
	})

	t.Run("medium does not belong same space", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		sameNameCount(mock, 0, Data["name"])
		ratingCountQuery(mock, 0)
		slugCheckMock(mock, Data)

		ratingInsertError(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("rating with same name exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		sameNameCount(mock, 1, Data["name"])

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("rating with same numeric value exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		sameNameCount(mock, 0, Data["name"])
		ratingCountQuery(mock, 1)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("create rating when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		sameNameCount(mock, 0, Data["name"])
		ratingCountQuery(mock, 0)
		slugCheckMock(mock, Data)

		ratingInsertMock(mock)
		SelectWithOutSpace(mock, Data)
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)

	})
}
