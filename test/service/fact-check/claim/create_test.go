package claim

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestClaimCreate(t *testing.T) {

	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable claim", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unable to decode claim", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("create claim", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Data)

		claimInsertMock(mock)
		claimSelectWithOutSpace(mock, Data)

		result := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(Data)

		validateAssociations(result)
		test.ExpectationsMet(t, mock)

	})

	t.Run("create claim with slug is empty", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Data)

		claimInsertMock(mock)
		claimSelectWithOutSpace(mock, Data)

		result := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(dataWithoutSlug).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(Data)
		validateAssociations(result)
		test.ExpectationsMet(t, mock)
	})

	t.Run("claimant does not belong same space", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Data)

		claimantFKError(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(dataWithoutSlug).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})
	t.Run("rating does not belong same space", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Data)

		ratingFKError(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(dataWithoutSlug).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

}
