package page

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/core/tag"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestPageDelete(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid page id", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.DELETE(path).
			WithPath("page_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)

		test.ExpectationsMet(t, mock)
	})

	t.Run("page record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		mock.ExpectQuery(selectQuery).
			WithArgs(true, 1, 100).
			WillReturnRows(sqlmock.NewRows(columns))

		e.DELETE(path).
			WithPath("page_id", "100").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("delete page", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectMock(mock, true, 1, 1)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_categories"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"post_id", "category_id"}).
				AddRow(1, 1))
		category.SelectWithOutSpace(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_tags"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"post_id", "tag_id"}).
				AddRow(1, 1))
		tag.SelectMock(mock, tag.Data, 1)

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_tags"`)).
			WillReturnResult(sqlmock.NewResult(0, 1))

		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_categories"`)).
			WillReturnResult(sqlmock.NewResult(0, 1))

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "post_authors" SET "deleted_at"=`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "posts" SET "deleted_at"=`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		e.DELETE(path).
			WithPath("page_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})

	t.Run("delete page when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		SelectMock(mock, true, 1, 1)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_categories"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"post_id", "category_id"}).
				AddRow(1, 1))
		category.SelectWithOutSpace(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_tags"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"post_id", "tag_id"}).
				AddRow(1, 1))
		tag.SelectMock(mock, tag.Data, 1)

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_tags"`)).
			WillReturnResult(sqlmock.NewResult(0, 1))

		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_categories"`)).
			WillReturnResult(sqlmock.NewResult(0, 1))

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "post_authors" SET "deleted_at"=`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "posts" SET "deleted_at"=`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectRollback()

		e.DELETE(path).
			WithPath("page_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})
}
