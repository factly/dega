package claim

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

func TestClaimCreate(t *testing.T) {

	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable claim", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unable to decode claim", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("create claim", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		slugCheckMock(mock, Data)

		claimInsertMock(mock)
		SelectWithOutSpace(mock, Data)
		mock.ExpectCommit()

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
		spacePermission.SelectQuery(mock, 1)

		slugCheckMock(mock, Data)

		claimInsertMock(mock)
		SelectWithOutSpace(mock, Data)
		mock.ExpectCommit()

		Data["slug"] = ""
		result := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object()
		Data["slug"] = "claim"
		result.ContainsMap(Data)
		validateAssociations(result)
		test.ExpectationsMet(t, mock)
	})

	t.Run("claimant does not belong same space", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		slugCheckMock(mock, Data)

		claimantFKError(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})
	t.Run("rating does not belong same space", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		slugCheckMock(mock, Data)

		ratingFKError(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("create claim when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		slugCheckMock(mock, Data)

		claimInsertMock(mock)
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
