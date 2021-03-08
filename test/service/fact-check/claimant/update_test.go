package claimant

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
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

var updatedClaimant = map[string]interface{}{
	"name": "TOI",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"type":"description"}`),
	},
	"tag_line":  "sample tag line",
	"medium_id": uint(1),
}

func TestClaimantUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid claimant id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		e.PUT(path).
			WithPath("claimant_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("claimant record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		recordNotFoundMock(mock)

		e.PUT(path).
			WithPath("claimant_id", "100").
			WithHeaders(headers).
			WithJSON(updatedClaimant).
			Expect().
			Status(http.StatusNotFound)
	})
	t.Run("Unable to decode claimant data", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		e.PUT(path).
			WithPath("claimant_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("Unprocessable claimant", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		e.PUT(path).
			WithPath("claimant_id", 1).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("update claimant", func(t *testing.T) {
		updatedClaimant["slug"] = "toi"
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectWithSpace(mock)

		claimantUpdateMock(mock, updatedClaimant, nil)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("claimant_id", 1).
			WithHeaders(headers).
			WithJSON(updatedClaimant).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(resData)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update claimant by id with empty slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		updatedClaimant["slug"] = "toi"
		SelectWithSpace(mock)

		slugCheckMock(mock, Data)

		claimantUpdateMock(mock, updatedClaimant, nil)
		mock.ExpectCommit()

		Data["slug"] = ""
		e.PUT(path).
			WithPath("claimant_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(resData)
		Data["slug"] = "toi"
		test.ExpectationsMet(t, mock)
	})

	t.Run("update claimant with different slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		updatedClaimant["slug"] = "toi-test"

		SelectWithSpace(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "claimants"`).
			WithArgs(fmt.Sprint(updatedClaimant["slug"], "%"), 1).
			WillReturnRows(sqlmock.NewRows([]string{"slug", "space_id"}))

		claimantUpdateMock(mock, updatedClaimant, nil)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("claimant_id", 1).
			WithHeaders(headers).
			WithJSON(updatedClaimant).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(resData)
		test.ExpectationsMet(t, mock)

	})

	t.Run("medium not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		updatedClaimant["slug"] = "toi-test"

		SelectWithSpace(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "claimants"`).
			WithArgs(fmt.Sprint(updatedClaimant["slug"], "%"), 1).
			WillReturnRows(sqlmock.NewRows([]string{"slug", "space_id"}))

		claimantUpdateMock(mock, updatedClaimant, errors.New("record not found"))
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("claimant_id", 1).
			WithHeaders(headers).
			WithJSON(updatedClaimant).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)

	})

	t.Run("update claimant when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		updatedClaimant["slug"] = "toi"
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectWithSpace(mock)

		claimantUpdateMock(mock, updatedClaimant, nil)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("claimant_id", 1).
			WithHeaders(headers).
			WithJSON(updatedClaimant).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})
}
