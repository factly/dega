package medium

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestMediumDelete(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid medium id", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.DELETE(path).
			WithPath("medium_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)

	})

	t.Run("medium record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		recordNotFoundMock(mock)

		e.DELETE(path).
			WithPath("medium_id", "100").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})
	t.Run("medium record deleted", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectWithSpace(mock)

		mediumDeleteMock(mock)
		mock.ExpectCommit()

		e.DELETE(path).
			WithPath("medium_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
	})

	t.Run("check medium associated with other posts", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectWithSpace(mock)

		mediumPostExpect(mock, 1)

		e.DELETE(path).
			WithPath("medium_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
	t.Run("check medium associated with other categories", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectWithSpace(mock)

		mediumPostExpect(mock, 0)
		mediumCategoryExpect(mock, 1)

		e.DELETE(path).
			WithPath("medium_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
	t.Run("check medium associated with other spaces", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectWithSpace(mock)

		mediumPostExpect(mock, 0)
		mediumCategoryExpect(mock, 0)
		mediumSpaceExpect(mock, 1)

		e.DELETE(path).
			WithPath("medium_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
	t.Run("check medium associated with other ratings", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectWithSpace(mock)

		mediumPostExpect(mock, 0)
		mediumCategoryExpect(mock, 0)
		mediumSpaceExpect(mock, 0)
		mediumRatingExpect(mock, 1)

		e.DELETE(path).
			WithPath("medium_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
	t.Run("check medium associated with other claimants", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectWithSpace(mock)

		mediumPostExpect(mock, 0)
		mediumCategoryExpect(mock, 0)
		mediumSpaceExpect(mock, 0)
		mediumRatingExpect(mock, 0)
		mediumClaimantExpect(mock, 1)

		e.DELETE(path).
			WithPath("medium_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

}
