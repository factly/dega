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
	"github.com/factly/dega-server/test/service/core/format"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

var updatePost = map[string]interface{}{
	"title":    "Post",
	"subtitle": "post subtitle",
	"status":   "draft",
	"excerpt":  "post excerpt",
	"is_page":  false,
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description":   "<p>Test Description</p>",
	"is_featured":        false,
	"is_sticky":          true,
	"is_highlighted":     true,
	"featured_medium_id": uint(1),
	"format_id":          uint(1),
	"category_ids":       []uint{1},
	"tag_ids":            []uint{1},
	"claim_ids":          []uint{1},
	"author_ids":         []uint{1},
}

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
			Status(http.StatusBadRequest)
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

	t.Run("cannot parse post description", func(t *testing.T) {
		updatePost["slug"] = "post"
		test.CheckSpaceMock(mock)

		postSelectWithSpace(mock)

		updatePost["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"block": "new"}`),
		}
		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusUnprocessableEntity)
		updatePost["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
		}

		test.ExpectationsMet(t, mock)
	})

	t.Run("updating post fails", func(t *testing.T) {
		updatePost["slug"] = "post"
		test.CheckSpaceMock(mock)

		preUpdateDraftMock(mock, updatePost, false)

		mock.ExpectExec(`UPDATE \"posts\"`).
			WithArgs(test.AnyTime{}, Data["is_page"], Data["is_featured"], Data["is_sticky"], Data["is_highlighted"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		medium.SelectWithSpace(mock)
		format.SelectMock(mock, 1, 1)
		mock.ExpectExec(`UPDATE \"posts\"`).
			WithArgs(test.AnyTime{}, 1, Data["title"], Data["subtitle"], Data["slug"], Data["excerpt"],
				Data["description"], Data["html_description"], Data["is_sticky"], Data["is_highlighted"], Data["featured_medium_id"], Data["format_id"], 1).
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

	t.Run("change post status back to draft", func(t *testing.T) {
		updatePost["slug"] = "post"
		test.CheckSpaceMock(mock)

		preUpdatePublishedMock(mock, updatePost, false)
		updatePublishedQueryMock(mock, updatePost, false)
		updatePostClaimsMock(mock)
		updatePostAuthorMock(mock)

		mock.ExpectCommit()

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(postData)

		test.ExpectationsMet(t, mock)
	})

	t.Run("user does not have publish permission when changing post status back to draft", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)
		gock.New(viper.GetString("keto_url")).
			Post("/engines/acp/ory/regex/allowed").
			Reply(http.StatusOK)

		gock.New(viper.GetString("keto_url")).
			Post("/engines/acp/ory/regex/allowed").
			Reply(http.StatusForbidden)

		test.CheckSpaceMock(mock)

		postSelectPublishedWithSpace(mock)
		preUpdateMock(mock, updatePost, false)

		mock.ExpectRollback()

		updatePost["status"] = "draft"
		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusUnauthorized)

		test.ExpectationsMet(t, mock)
		updatePost["status"] = "draft"
	})

	t.Run("keto down when changing post status back to draft", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)

		gock.New(viper.GetString("keto_url")).
			Post("/engines/acp/ory/regex/allowed").
			Reply(http.StatusOK)

		test.CheckSpaceMock(mock)

		postSelectPublishedWithSpace(mock)
		preUpdateMock(mock, updatePost, false)

		mock.ExpectRollback()

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusUnauthorized)

		test.ExpectationsMet(t, mock)
	})

	gock.Off()
	test.MockServer()
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	updatePost["status"] = "draft"

	t.Run("deleting old post_claims fails", func(t *testing.T) {
		updatePost["slug"] = "post"
		test.CheckSpaceMock(mock)

		preUpdateDraftMock(mock, updatePost, false)
		updateQueryMock(mock, updatePost, false)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_claims"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "claim_id", "post_id"}).
				AddRow(1, time.Now(), time.Now(), nil, 2, 1))

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "post_claims" SET "deleted_at"=`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnError(errors.New("cannot delete post_claims"))

		mock.ExpectRollback()

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("adding post_claims fails", func(t *testing.T) {
		updatePost["slug"] = "post"
		test.CheckSpaceMock(mock)

		preUpdateDraftMock(mock, updatePost, false)
		updateQueryMock(mock, updatePost, false)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_claims"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "claim_id", "post_id", "position"}).
				AddRow(1, time.Now(), time.Now(), nil, 2, 1, 1))

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "post_claims" SET "deleted_at"=`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		mock.ExpectQuery(`INSERT INTO "post_claims"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, 1, 1, 1).
			WillReturnError(errors.New(`cannot create post claims`))

		mock.ExpectRollback()

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("deleting old post_authors fails", func(t *testing.T) {
		updatePost["slug"] = "post"
		test.CheckSpaceMock(mock)

		preUpdateDraftMock(mock, updatePost, false)
		updateQueryMock(mock, updatePost, false)
		updatePostClaimsMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "author_id", "post_id"}).
				AddRow(1, time.Now(), time.Now(), nil, 2, 1))

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "post_authors" SET "deleted_at"=`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnError(errors.New("cannot delete post_authors"))

		mock.ExpectRollback()

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("creating post_authors fails", func(t *testing.T) {
		updatePost["slug"] = "post"
		test.CheckSpaceMock(mock)

		preUpdateDraftMock(mock, updatePost, false)
		updateQueryMock(mock, updatePost, false)
		updatePostClaimsMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "author_id", "post_id"}).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, 2, 1))

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "post_authors" SET "deleted_at"=`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		mock.ExpectQuery(`INSERT INTO "post_authors"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, 1, 1).
			WillReturnError(errors.New("cannot create post_authors"))

		mock.ExpectRollback()

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusInternalServerError)
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
}
