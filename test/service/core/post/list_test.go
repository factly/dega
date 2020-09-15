package post

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/format"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/fact-check/claim"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestPostList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

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
		format.SelectWithOutSpace(mock)

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
		format.SelectWithOutSpace(mock)

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

	t.Run("get list of posts based on filters", func(t *testing.T) {
		postListMock(mock)

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"tag":      "2",
				"category": "2",
				"author":   "2",
			}).
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

	t.Run("get list of posts based on filters and query", func(t *testing.T) {
		postListMock(mock)

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"tag":      "2",
				"category": "2",
				"q":        "test",
				"author":   "1",
				"format":   "2",
				"status":   "published",
			}).
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

	t.Run("when query does not match any post", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		test.DisableMeiliGock(testServer.URL)

		gock.New(config.MeiliURL + "/indexes/dega/search").
			HeaderPresent("X-Meili-API-Key").
			Persist().
			Reply(http.StatusOK).
			JSON(test.EmptyMeili)

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"tag":      "2",
				"category": "2",
				"q":        "test",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("total").
			Equal(0)

		test.ExpectationsMet(t, mock)
	})

	t.Run("when meili is down", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		test.DisableMeiliGock(testServer.URL)

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"tag":    "2",
				"q":      "test",
				"author": "1",
			}).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})
}
