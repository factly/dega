package claimant

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/organisationPermission"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestClaimantCreate(t *testing.T) {

	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable claimant", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		organisationPermission.SelectQuery(mock, 1)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unable to decode claimant", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		organisationPermission.SelectQuery(mock, 1)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("create claimant", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		organisationPermission.SelectQuery(mock, 1)

		slugCheckMock(mock, Data)

		claimantInsertMock(mock)
		SelectWithOutSpace(mock, Data)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(resData)
		test.ExpectationsMet(t, mock)

	})

	t.Run("create claimant with slug is empty", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		organisationPermission.SelectQuery(mock, 1)

		slugCheckMock(mock, Data)

		claimantInsertMock(mock)

		SelectWithOutSpace(mock, Data)
		mock.ExpectCommit()

		Data["slug"] = ""
		res := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object()
		Data["slug"] = "toi"
		res.ContainsMap(resData)

		test.ExpectationsMet(t, mock)
	})

	t.Run("medium does not belong same space", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		organisationPermission.SelectQuery(mock, 1)

		slugCheckMock(mock, Data)

		claimantInsertError(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("create claimant when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		organisationPermission.SelectQuery(mock, 1)

		slugCheckMock(mock, Data)

		claimantInsertMock(mock)
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
