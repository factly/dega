package page

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestPageList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list of pages", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		pageCountQuery(mock, 0)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "post_id", "author_id"}))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})

		test.ExpectationsMet(t, mock)
	})

	t.Run("get non-empty list of pages", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		pageCountQuery(mock, len(pageList))

		mock.ExpectQuery(selectQuery).
			WithArgs(1, true).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, pageList[0]["title"], pageList[0]["subtitle"], pageList[0]["slug"], pageList[0]["status"], pageList[0]["is_page"], pageList[0]["excerpt"],
					pageList[0]["description"], pageList[0]["html_description"], pageList[0]["is_featured"], pageList[0]["is_sticky"], pageList[0]["is_highlighted"], pageList[0]["featured_medium_id"], pageList[0]["format_id"], pageList[0]["published_date"], 1).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, pageList[1]["title"], pageList[1]["subtitle"], pageList[1]["slug"], pageList[1]["status"], pageList[1]["is_page"], pageList[1]["excerpt"],
					pageList[1]["description"], pageList[1]["html_description"], pageList[1]["is_featured"], pageList[1]["is_sticky"], pageList[1]["is_highlighted"], pageList[1]["featured_medium_id"], pageList[1]["format_id"], pageList[1]["published_date"], 1))

		preloadMock(mock)

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
			ContainsMap(map[string]interface{}{"total": len(pageList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(pageList[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get pages with paiganation", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		pageCountQuery(mock, len(pageList))

		mock.ExpectQuery(selectQuery).
			WithArgs(1, true).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, pageList[1]["title"], pageList[1]["subtitle"], pageList[1]["slug"], pageList[1]["status"], pageList[1]["is_page"], pageList[1]["excerpt"],
					pageList[1]["description"], pageList[1]["html_description"], pageList[1]["is_featured"], pageList[1]["is_sticky"], pageList[1]["is_highlighted"], pageList[1]["featured_medium_id"], pageList[1]["format_id"], pageList[1]["published_date"], 1))

		preloadMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "author_id", "post_id"}).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1))

		e.GET(basePath).
			WithQueryObject(map[string]interface{}{
				"page":  2,
				"limit": 1,
				"sort":  "asc",
			}).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(pageList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(pageList[1])

		test.ExpectationsMet(t, mock)
	})
}
