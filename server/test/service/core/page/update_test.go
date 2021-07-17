package page

import (
	"database/sql/driver"
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/core/format"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/core/tag"
	"github.com/gavv/httpexpect"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

func TestPageUpdate(t *testing.T) {
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
		e.PUT(path).
			WithPath("page_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid page body", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("page_id", 1).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("undecodable page body", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("page_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("page record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		mock.ExpectQuery(selectQuery).
			WithArgs(true, 1, 100).
			WillReturnRows(sqlmock.NewRows(columns))

		e.PUT(path).
			WithPath("page_id", "100").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("cannot parse page description", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectMock(mock, true, 1, 1)

		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"invalid":"block"}`),
		}
		e.PUT(path).
			WithPath("page_id", "1").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
		}
	})

	t.Run("updating tags fail", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectMock(mock, true, 1, 1)
		mock.ExpectBegin()
		// get new tags & categories to update
		tag.SelectMock(mock, tag.Data, 1)

		medium.SelectWithSpace(mock)
		format.SelectMock(mock, 1, 1)

		mock.ExpectExec(`UPDATE "posts" SET`).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(driver.ResultNoRows)

		mock.ExpectQuery(`INSERT INTO "tags"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, tag.Data["name"], tag.Data["slug"], tag.Data["description"], tag.Data["html_description"], tag.Data["is_featured"], 1, 1).
			WillReturnError(errors.New(`cannot update post tags`))

		mock.ExpectRollback()

		e.PUT(path).
			WithPath("page_id", "1").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("updating categories fails", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectMock(mock, true, 1, 1)
		mock.ExpectBegin()
		tag.SelectMock(mock, tag.Data, 1)

		medium.SelectWithSpace(mock)
		format.SelectMock(mock, 1, 1)

		mock.ExpectExec(`UPDATE "posts" SET`).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(driver.ResultNoRows)

		mock.ExpectQuery(`INSERT INTO "tags"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, tag.Data["name"], tag.Data["slug"], tag.Data["description"], tag.Data["html_description"], tag.Data["is_featured"], 1, 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		mock.ExpectExec(`INSERT INTO "post_tags"`).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))

		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_tags"`)).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))

		category.SelectWithOutSpace(mock)

		medium.SelectWithSpace(mock)
		format.SelectMock(mock, 1, 1)
		mock.ExpectExec(`UPDATE "posts" SET`).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(driver.ResultNoRows)

		medium.SelectWithSpace(mock)
		mock.ExpectQuery(`INSERT INTO "categories"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["is_featured"], sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnError(errors.New(`cannot update page categories`))

		mock.ExpectRollback()

		e.PUT(path).
			WithPath("page_id", "1").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update page", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectMock(mock, true, 1, 1)
		mock.ExpectBegin()
		tag.SelectMock(mock, tag.Data, 1)

		medium.SelectWithSpace(mock)
		format.SelectMock(mock, 1, 1)

		mock.ExpectExec(`UPDATE "posts" SET`).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(driver.ResultNoRows)

		mock.ExpectQuery(`INSERT INTO "tags"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, tag.Data["name"], tag.Data["slug"], tag.Data["description"], tag.Data["html_description"], tag.Data["is_featured"], 1, 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		mock.ExpectExec(`INSERT INTO "post_tags"`).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))

		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_tags"`)).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))

		category.SelectWithOutSpace(mock)

		medium.SelectWithSpace(mock)
		format.SelectMock(mock, 1, 1)
		mock.ExpectExec(`UPDATE "posts" SET`).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(driver.ResultNoRows)

		medium.SelectWithSpace(mock)
		mock.ExpectQuery(`INSERT INTO "categories"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["is_featured"], sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.
				NewRows([]string{"id", "parent_id", "medium_id"}).
				AddRow(1, 1, 1))

		mock.ExpectExec(`INSERT INTO "post_categories"`).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))

		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_categories"`)).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))

		medium.SelectWithSpace(mock)
		format.SelectMock(mock, 1, 1)
		mock.ExpectExec(`UPDATE \"posts\"`).
			WithArgs(test.AnyTime{}, Data["is_featured"], Data["is_sticky"], Data["is_highlighted"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		medium.SelectWithSpace(mock)
		format.SelectMock(mock, 1, 1)
		mock.ExpectExec(`UPDATE \"posts\"`).
			WithArgs(test.AnyTime{}, 1, Data["title"], Data["subtitle"], Data["slug"], Data["status"], Data["excerpt"],
				Data["description"], Data["html_description"], Data["is_sticky"], Data["is_highlighted"], Data["featured_medium_id"], Data["format_id"], test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		SelectMock(mock)
		preloadMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "author_id", "post_id"}).AddRow(1, time.Now(), time.Now(), nil, 1, 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "author_id", "post_id"}).AddRow(1, time.Now(), time.Now(), nil, 1, 1))

		mock.ExpectCommit()

		e.PUT(path).
			WithPath("page_id", "1").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().
			Object().ContainsMap(pageData)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update page when featured_medium_id = 0", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		SelectMock(mock, true, 1, 1)
		mock.ExpectBegin()
		tag.SelectMock(mock, tag.Data, 1)

		medium.SelectWithSpace(mock)
		format.SelectMock(mock, 1, 1)

		mock.ExpectExec(`UPDATE "posts" SET`).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(driver.ResultNoRows)

		mock.ExpectQuery(`INSERT INTO "tags"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, tag.Data["name"], tag.Data["slug"], tag.Data["description"], tag.Data["html_description"], tag.Data["is_featured"], 1, 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		mock.ExpectExec(`INSERT INTO "post_tags"`).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))

		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_tags"`)).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))

		category.SelectWithOutSpace(mock)

		medium.SelectWithSpace(mock)
		format.SelectMock(mock, 1, 1)
		mock.ExpectExec(`UPDATE "posts" SET`).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(driver.ResultNoRows)

		medium.SelectWithSpace(mock)
		mock.ExpectQuery(`INSERT INTO "categories"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["is_featured"], sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.
				NewRows([]string{"id", "parent_id", "medium_id"}).
				AddRow(1, 1, 1))

		mock.ExpectExec(`INSERT INTO "post_categories"`).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))

		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_categories"`)).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))

		format.SelectMock(mock, 1, 1)
		mock.ExpectExec(`UPDATE \"posts\"`).
			WithArgs(nil, test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		format.SelectMock(mock, 1, 1)
		mock.ExpectExec(`UPDATE \"posts\"`).
			WithArgs(test.AnyTime{}, Data["is_featured"], Data["is_sticky"], Data["is_highlighted"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		format.SelectMock(mock, 1, 1)
		mock.ExpectExec(`UPDATE \"posts\"`).
			WithArgs(test.AnyTime{}, 1, Data["title"], Data["subtitle"], Data["slug"], Data["status"], Data["excerpt"],
				Data["description"], Data["html_description"], Data["is_sticky"], Data["is_highlighted"], Data["format_id"], test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		SelectMock(mock)
		preloadMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "author_id", "post_id"}).AddRow(1, time.Now(), time.Now(), nil, 1, 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "author_id", "post_id"}).AddRow(1, time.Now(), time.Now(), nil, 1, 1))

		mock.ExpectCommit()

		Data["featured_medium_id"] = 0
		e.PUT(path).
			WithPath("page_id", "1").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().
			Object().ContainsMap(pageData)
		test.ExpectationsMet(t, mock)
		Data["featured_medium_id"] = 1
	})

}
