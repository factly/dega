package post

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

var updatePost = map[string]interface{}{
	"title":              "Post",
	"subtitle":           "post subtitle",
	"status":             "published",
	"excerpt":            "post excerpt",
	"description":        test.NilJsonb(),
	"is_featured":        false,
	"is_sticky":          true,
	"is_highlighted":     true,
	"featured_medium_id": uint(1),
	"format_id":          uint(1),
	"published_date":     time.Time{},
	"category_ids":       []uint{1},
	"tag_ids":            []uint{1},
	"claim_ids":          []uint{1},
	"author_ids":         []uint{1},
}

var errorDB = errors.New("Something went wrong with db queries")

func TestPostUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid post id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("post_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("post record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		recordNotFoundMock(mock)

		e.PUT(path).
			WithPath("post_id", "100").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)
	})
	t.Run("Unable to decode post data", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("Unprocessable post", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("updating post fails", func(t *testing.T) {
		updatePost["slug"] = "post"
		test.CheckSpaceMock(mock)

		preUpdateMock(mock, updatePost, false)
		mock.ExpectExec(`UPDATE \"posts\" SET (.+)  WHERE (.+) \"posts\".\"id\" = `).
			WithArgs(updatePost["description"], updatePost["excerpt"], updatePost["featured_medium_id"], updatePost["format_id"],
				updatePost["is_highlighted"], updatePost["is_sticky"], updatePost["slug"], updatePost["status"], updatePost["subtitle"], updatePost["title"],
				test.AnyTime{}, 1).
			WillReturnError(errors.New("cannot update post"))

		mock.ExpectRollback()

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("update post", func(t *testing.T) {
		updatePost["slug"] = "post"
		test.CheckSpaceMock(mock)

		updateMock(mock, updatePost, false)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(postData)

		test.ExpectationsMet(t, mock)
	})

	t.Run("update post when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		updatePost["slug"] = "post"
		test.CheckSpaceMock(mock)

		updateMock(mock, updatePost, false)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
		test.MockServer()
	})

	t.Run("update post by id with empty slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatePost["slug"] = "post"

		updateMock(mock, updatePost, true)
		mock.ExpectCommit()

		Data["slug"] = ""
		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(postData)
		Data["slug"] = "post"
		test.ExpectationsMet(t, mock)

	})

	t.Run("update post with different slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatePost["slug"] = "post-test"

		updateMock(mock, updatePost, true)
		mock.ExpectCommit()

		postData["slug"] = "post-test"

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(postData)

		test.ExpectationsMet(t, mock)

	})

	t.Run("error while deleting old post tags", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatePost["slug"] = "post"
		updatePost["tag_ids"] = []uint{}
		updatePost["category_ids"] = []uint{}

		postSelectWithSpace(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM  "tags" INNER JOIN "post_tags"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(append([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}, []string{"tag_id", "post_id"}...)).
				AddRow(1, time.Now(), time.Now(), nil, "title1", "slug1", 1, 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories" INNER JOIN "post_categories"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(append([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}, []string{"category_id", "post_id"}...)).
				AddRow(1, time.Now(), time.Now(), nil, "title1", "slug1", 1, 1))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "tags"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}))

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_tags"`)).
			WithArgs(1, 1).
			WillReturnError(errorDB)
		mock.ExpectRollback()
		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)

	})

	t.Run("error while deleting old post categories", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatePost["slug"] = "post"
		updatePost["tag_ids"] = []uint{}
		updatePost["category_ids"] = []uint{}

		postSelectWithSpace(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM  "tags" INNER JOIN "post_tags"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(append([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}, []string{"tag_id", "post_id"}...)).
				AddRow(1, time.Now(), time.Now(), nil, "title1", "slug1", 1, 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories" INNER JOIN "post_categories"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(append([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}, []string{"category_id", "post_id"}...)).
				AddRow(1, time.Now(), time.Now(), nil, "title1", "slug1", 1, 1))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "tags"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}))

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_tags"`)).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_categories"`)).
			WithArgs(1, 1).
			WillReturnError(errorDB)
		mock.ExpectRollback()
		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)

	})

	t.Run("error while deleting old post categories", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatePost["featured_medium_id"] = 0

		postSelectWithSpace(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM  "tags" INNER JOIN "post_tags"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(append([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}, []string{"tag_id", "post_id"}...)).
				AddRow(1, time.Now(), time.Now(), nil, "title1", "slug1", 1, 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories" INNER JOIN "post_categories"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(append([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}, []string{"category_id", "post_id"}...)).
				AddRow(1, time.Now(), time.Now(), nil, "title1", "slug1", 1, 1))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "tags"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}))

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_tags"`)).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_categories"`)).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectExec(`UPDATE \"posts\" SET (.+)  WHERE (.+) \"posts\".\"id\" = `).
			WithArgs(nil, test.AnyTime{}, 1).
			WillReturnError(errorDB)
		mock.ExpectRollback()
		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)

	})

}
