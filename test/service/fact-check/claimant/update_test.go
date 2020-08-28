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
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

var updatedClaimant = map[string]interface{}{
	"name":        "TOI",
	"description": "article is validated",
	"tag_line":    "sample tag line",
	"medium_id":   uint(1),
}

func TestClaimantUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid claimant id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("claimant_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("claimant record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
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

		e.PUT(path).
			WithPath("claimant_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("Unprocessable claimant", func(t *testing.T) {

		test.CheckSpaceMock(mock)

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

		SelectWithSpace(mock)

		claimantUpdateMock(mock, updatedClaimant, nil)

		e.PUT(path).
			WithPath("claimant_id", 1).
			WithHeaders(headers).
			WithJSON(updatedClaimant).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedClaimant)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update claimant by id with empty slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedClaimant["slug"] = "toi"
		SelectWithSpace(mock)

		slugCheckMock(mock, Data)

		claimantUpdateMock(mock, updatedClaimant, nil)

		e.PUT(path).
			WithPath("claimant_id", 1).
			WithHeaders(headers).
			WithJSON(dataWithoutSlug).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedClaimant)
		test.ExpectationsMet(t, mock)

	})

	t.Run("update claimant with different slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedClaimant["slug"] = "toi-test"

		SelectWithSpace(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "claimants"`).
			WithArgs(fmt.Sprint(updatedClaimant["slug"], "%"), 1).
			WillReturnRows(sqlmock.NewRows([]string{"slug", "space_id"}))

		claimantUpdateMock(mock, updatedClaimant, nil)

		e.PUT(path).
			WithPath("claimant_id", 1).
			WithHeaders(headers).
			WithJSON(updatedClaimant).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(updatedClaimant)
		test.ExpectationsMet(t, mock)

	})

	t.Run("medium not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatedClaimant["slug"] = "toi-test"

		SelectWithSpace(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "claimants"`).
			WithArgs(fmt.Sprint(updatedClaimant["slug"], "%"), 1).
			WillReturnRows(sqlmock.NewRows([]string{"slug", "space_id"}))

		claimantUpdateMock(mock, updatedClaimant, errors.New("record not found"))

		e.PUT(path).
			WithPath("claimant_id", 1).
			WithHeaders(headers).
			WithJSON(updatedClaimant).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)

	})

}
