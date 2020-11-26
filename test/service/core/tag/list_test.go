package tag

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestTagList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	taglist := []map[string]interface{}{
		{"name": "Test Tag 1", "slug": "test-tag-1"},
		{"name": "Test Tag 2", "slug": "test-tag-2"},
	}

	t.Run("get empty list of tags", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		tagCountQuery(mock, 0)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})

		test.ExpectationsMet(t, mock)
	})

	t.Run("get non-empty list of tags", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		tagCountQuery(mock, len(taglist))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, taglist[0]["name"], taglist[0]["slug"], taglist[0]["is_featured"], 1).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, taglist[1]["name"], taglist[1]["slug"], taglist[1]["is_featured"], 1))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(taglist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(taglist[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get tags with pagination", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		tagCountQuery(mock, len(taglist))

		mock.ExpectQuery(paginationQuery).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, taglist[1]["name"], taglist[1]["slug"], taglist[1]["is_featured"], 1))

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
			ContainsMap(map[string]interface{}{"total": len(taglist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(taglist[1])

		test.ExpectationsMet(t, mock)

	})

	t.Run("get list of tags based on search query q", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		tagCountQuery(mock, len(taglist))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, taglist[0]["name"], taglist[0]["slug"], taglist[0]["is_featured"], 1).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, taglist[1]["name"], taglist[1]["slug"], taglist[1]["is_featured"], 1))

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"q":    "test",
				"sort": "asc",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(taglist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(taglist[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("when query does not match any tag", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		test.DisableMeiliGock(testServer.URL)

		gock.New(viper.GetString("meili_url") + "/indexes/dega/search").
			HeaderPresent("X-Meili-API-Key").
			Persist().
			Reply(http.StatusOK).
			JSON(test.EmptyMeili)

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"q":    "test",
				"sort": "asc",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("total").
			Equal(0)

		test.ExpectationsMet(t, mock)
	})

	t.Run("search with query q when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"q":    "test",
				"sort": "asc",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("total").
			Equal(0)
		test.ExpectationsMet(t, mock)
	})
}
