package organisation

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestOrganisaitonRequestDelete(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid request id", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.DELETE(path).
			WithPath("request_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)

		test.ExpectationsMet(t, mock)
	})

	t.Run("request record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.DELETE(path).
			WithPath("request_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("request deleted", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, 1)

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "organisation_permission_requests"`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		e.DELETE(path).
			WithPath("request_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)

		test.ExpectationsMet(t, mock)
	})
}
