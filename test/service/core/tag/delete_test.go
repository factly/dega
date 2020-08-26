package tag

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestTagDelete(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid tag id", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.DELETE(path).
			WithPath("tag_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)

	})

	t.Run("tag record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		recordNotFoundMock(mock)

		e.DELETE(path).
			WithPath("tag_id", "100").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("check tag associated with other entity", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		tagSelectMock(mock)

		tagPostExpect(mock, 1)

		e.DELETE(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("tag record deleted", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		tagSelectMock(mock)

		tagPostExpect(mock, 0)

		mock.ExpectBegin()
		mock.ExpectExec(deleteQuery).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		e.DELETE(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
	})

}
