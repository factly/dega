package space

import (
	"database/sql/driver"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/permissions/space"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestSpaceRequestApprove(t *testing.T) {
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
		e.POST(approvePath).
			WithPath("request_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
		test.ExpectationsMet(t, mock)
	})

	t.Run("request record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs("pending", 1).
			WillReturnRows(mock.NewRows(Columns))

		e.POST(approvePath).
			WithPath("request_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("space permission already exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, "pending", 1)

		space.SelectQuery(mock, 1)

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"space_permissions\"`).
			WithArgs(Data["fact_check"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		mock.ExpectExec(`UPDATE \"space_permissions\"`).
			WithArgs(test.AnyTime{}, 1, Data["fact_check"], Data["space_id"], Data["media"], Data["posts"], 1).
			WillReturnResult(driver.ResultNoRows)
		space.SelectQuery(mock)

		mock.ExpectExec(`UPDATE \"space_permission_requests\"`).
			WithArgs(test.AnyTime{}, 1, "approved", 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		e.POST(approvePath).
			WithPath("request_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})

	t.Run("create space permission based on request", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, "pending", 1)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "space_permissions"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "space_id", "fact_check", "media", "posts"}))

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "space_permissions"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["fact_check"], Data["space_id"], Data["media"], Data["posts"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		mock.ExpectExec(`UPDATE \"space_permission_requests\"`).
			WithArgs(test.AnyTime{}, 1, "approved", 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		e.POST(approvePath).
			WithPath("request_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})
}
