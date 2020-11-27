package claim

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/spacePermission"
	"github.com/factly/dega-server/test/service/fact-check/claimant"
	"github.com/factly/dega-server/test/service/fact-check/rating"
	"github.com/gavv/httpexpect/v2"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestClaimList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list of claims", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)
		claimCountQuery(mock, 0)

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

	t.Run("get non-empty list of claims", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)
		claimCountQuery(mock, len(claimList))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, claimList[0]["title"], claimList[0]["slug"], claimList[0]["claim_date"], claimList[0]["checked_date"], claimList[0]["claim_sources"],
					claimList[0]["description"], claimList[0]["claimant_id"], claimList[0]["rating_id"], claimList[0]["review"], claimList[0]["review_tag_line"], claimList[0]["review_sources"], 1).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, claimList[1]["title"], claimList[1]["slug"], claimList[1]["claim_date"], claimList[1]["checked_date"], claimList[1]["claim_sources"],
					claimList[1]["description"], claimList[1]["claimant_id"], claimList[1]["rating_id"], claimList[1]["review"], claimList[1]["review_tag_line"], claimList[1]["review_sources"], 1))
		claimant.SelectWithOutSpace(mock, claimant.Data)
		rating.SelectWithOutSpace(mock, rating.Data)

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(claimList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(claimList[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get claims with pagination", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)
		claimCountQuery(mock, len(claimList))

		mock.ExpectQuery(paginationQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, claimList[1]["title"], claimList[1]["slug"], claimList[1]["claim_date"], claimList[1]["checked_date"], claimList[1]["claim_sources"],
					claimList[1]["description"], claimList[1]["claimant_id"], claimList[1]["rating_id"], claimList[1]["review"], claimList[1]["review_tag_line"], claimList[1]["review_sources"], 1))

		claimant.SelectWithOutSpace(mock, claimant.Data)
		rating.SelectWithOutSpace(mock, rating.Data)

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
			ContainsMap(map[string]interface{}{"total": len(claimList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(claimList[1])

		test.ExpectationsMet(t, mock)

	})

	t.Run("get list of claims based on filters", func(t *testing.T) {
		claimListMock(mock)
		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"claimant": "2",
				"rating":   "2",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(claimList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(claimList[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of claims based on filters and query", func(t *testing.T) {
		claimListMock(mock)

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"claimant": "2",
				"rating":   "2",
				"q":        "test",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(claimList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(claimList[0])

		test.ExpectationsMet(t, mock)

	})

	t.Run("when query does not match any claim", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)
		test.DisableMeiliGock(testServer.URL)

		gock.New(viper.GetString("meili_url") + "/indexes/dega/search").
			HeaderPresent("X-Meili-API-Key").
			Persist().
			Reply(http.StatusOK).
			JSON(test.EmptyMeili)

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"claimant": "2",
				"rating":   "2",
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
		spacePermission.SelectQuery(mock, 1)
		test.DisableMeiliGock(testServer.URL)

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"claimant":  "2",
				"format_id": "2",
				"q":         "test",
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
