package post

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/fact-check/claim"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestPostList(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	postList := []map[string]interface{}{
		{
			"title":              "Post 1",
			"subtitle":           "post subtitle 1",
			"slug":               "post-1",
			"status":             "published",
			"excerpt":            "post excerpt",
			"description":        test.NilJsonb(),
			"is_featured":        false,
			"is_sticky":          true,
			"is_highlighted":     true,
			"featured_medium_id": uint(1),
			"format_id":          uint(1),
			"published_date":     time.Time{},
		},
		{
			"title":              "Post 2",
			"subtitle":           "post subtitle",
			"slug":               "post-2",
			"status":             "published",
			"excerpt":            "post excerpt",
			"description":        test.NilJsonb(),
			"is_featured":        false,
			"is_sticky":          true,
			"is_highlighted":     true,
			"featured_medium_id": uint(1),
			"format_id":          uint(1),
			"published_date":     time.Time{},
		},
	}

	t.Run("get empty list of posts", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		postCountQuery(mock, 0)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "tags"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}).
				AddRow(1, time.Now(), time.Now(), nil, "Tag test 1", "tag-test-1", 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}).
				AddRow(1, time.Now(), time.Now(), nil, "Tag test 1", "tag-test-1", 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_claims"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}).
				AddRow(1, time.Now(), time.Now(), nil, "Tag test 1", "tag-test-1", 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}).
				AddRow(1, time.Now(), time.Now(), nil, "Tag test 1", "tag-test-1", 1))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})

		test.ExpectationsMet(t, mock)
	})

	t.Run("get non-empty list of posts", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		postCountQuery(mock, len(postList))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, postList[0]["title"], postList[0]["subtitle"], postList[0]["slug"], postList[0]["status"], postList[0]["excerpt"],
					postList[0]["description"], postList[0]["is_featured"], postList[0]["is_sticky"], postList[0]["is_highlighted"], postList[0]["featured_medium_id"], postList[0]["format_id"], postList[0]["published_date"], 1).
				AddRow(2, time.Now(), time.Now(), nil, postList[1]["title"], postList[1]["subtitle"], postList[1]["slug"], postList[1]["status"], postList[1]["excerpt"],
					postList[1]["description"], postList[1]["is_featured"], postList[1]["is_sticky"], postList[1]["is_highlighted"], postList[1]["featured_medium_id"], postList[1]["format_id"], postList[1]["published_date"], 1))

		medium.SelectWithOutSpace(mock)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "formats"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}).
				AddRow(1, time.Now(), time.Now(), nil, "Fact check", "factcheck"))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "tags"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}).
				AddRow(1, time.Now(), time.Now(), nil, "Tag test 1", "tag-test-1", 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}).
				AddRow(1, time.Now(), time.Now(), nil, "Tag test 1", "tag-test-1", 1))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_claims"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "claim_id", "post_id"}).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1))

		claim.SelectWithOutSpace(mock, claim.Data)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "author_id", "post_id"}).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(postList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(postList[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get posts with pagination", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		postCountQuery(mock, len(postList))

		mock.ExpectQuery(paginationQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(2, time.Now(), time.Now(), nil, postList[1]["title"], postList[1]["subtitle"], postList[1]["slug"], postList[1]["status"], postList[1]["excerpt"],
					postList[1]["description"], postList[1]["is_featured"], postList[1]["is_sticky"], postList[1]["is_highlighted"], postList[1]["featured_medium_id"], postList[1]["format_id"], postList[1]["published_date"], 1))

		medium.SelectWithOutSpace(mock)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "formats"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}).
				AddRow(1, time.Now(), time.Now(), nil, "Fact check", "factcheck"))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "tags"`)).
			WithArgs(2).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}).
				AddRow(1, time.Now(), time.Now(), nil, "Tag test 1", "tag-test-1", 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WithArgs(2).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}).
				AddRow(1, time.Now(), time.Now(), nil, "Tag test 1", "tag-test-1", 1))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_claims"`)).
			WithArgs(2).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "claim_id", "post_id"}).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1))

		claim.SelectWithOutSpace(mock, claim.Data)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
			WithArgs(2).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "author_id", "post_id"}).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1))

		e.GET(basePath).
			WithQueryObject(map[string]interface{}{
				"limit": "1",
				"page":  "2",
			}).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(postList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(postList[1])

		test.ExpectationsMet(t, mock)

	})
}
