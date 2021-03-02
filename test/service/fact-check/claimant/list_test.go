package claimant

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/permissions/space"
	"github.com/factly/dega-server/util"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestClaimantList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	claimantlist := []map[string]interface{}{
		{"name": "Test Claimant 1", "slug": "test-claimant-1", "description": postgres.Jsonb{
			RawMessage: []byte(`{"type":"description1"}`),
		}},
		{"name": "Test Claimant 2", "slug": "test-claimant-2", "description": postgres.Jsonb{
			RawMessage: []byte(`{"type":"description2"}`),
		}},
	}

	s := test.RunDefaultNATSServer()
	defer s.Shutdown()
	util.ConnectNats()

	t.Run("get empty list of claimants", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		claimantCountQuery(mock, 0)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})

		test.ExpectationsMet(t, mock)
	})

	t.Run("get non-empty list of claimants", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		claimantCountQuery(mock, len(claimantlist))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, claimantlist[0]["name"], claimantlist[0]["slug"], claimantlist[0]["medium_id"], claimantlist[0]["description"], claimantlist[0]["numeric_value"], 1).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, claimantlist[1]["name"], claimantlist[1]["slug"], claimantlist[1]["medium_id"], claimantlist[1]["description"], claimantlist[1]["numeric_value"], 1))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(claimantlist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(claimantlist[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get claimants with pagination", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		claimantCountQuery(mock, len(claimantlist))

		mock.ExpectQuery(paginationQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, claimantlist[1]["name"], claimantlist[1]["slug"], claimantlist[1]["medium_id"], claimantlist[1]["description"], claimantlist[1]["numeric_value"], 1))

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
			ContainsMap(map[string]interface{}{"total": len(claimantlist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(claimantlist[1])

		test.ExpectationsMet(t, mock)

	})

	t.Run("get list of claimants based on search query q", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		claimantCountQuery(mock, len(claimantlist))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, claimantlist[0]["name"], claimantlist[0]["slug"], claimantlist[0]["medium_id"], claimantlist[0]["description"], claimantlist[0]["numeric_value"], 1).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, claimantlist[1]["name"], claimantlist[1]["slug"], claimantlist[1]["medium_id"], claimantlist[1]["description"], claimantlist[1]["numeric_value"], 1))

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
			ContainsMap(map[string]interface{}{"total": len(claimantlist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(claimantlist[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("when query does not match any claimant", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
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
		space.SelectQuery(mock, 1)

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
