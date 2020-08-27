package rating

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestRatingCreate(t *testing.T) {

	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable rating", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unable to decode rating", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("create rating", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Rating)

		ratingInsertMock(mock)
		ratingSelectWithOutSpace(mock, Rating)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Rating).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(Rating)
		test.ExpectationsMet(t, mock)

	})

	t.Run("create rating with slug is empty", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Rating)

		ratingInsertMock(mock)

		ratingSelectWithOutSpace(mock, Rating)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(dataWithoutSlug).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(Rating)

		test.ExpectationsMet(t, mock)
	})

}
