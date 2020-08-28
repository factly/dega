package claim

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/fact-check/claimant"
	"github.com/factly/dega-server/test/service/fact-check/rating"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestClaimList(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	claimList := []map[string]interface{}{
		{
			"title":           "Claim 1",
			"slug":            "claim-test",
			"claim_date":      time.Time{},
			"checked_date":    time.Time{},
			"claim_sources":   "GOI",
			"description":     test.NilJsonb(),
			"claimant_id":     uint(1),
			"rating_id":       uint(1),
			"review":          "Succesfully reviewed",
			"review_tag_line": "tag line",
			"review_sources":  "TOI",
		},
		{
			"title":           "Claim 2",
			"slug":            "claim-test",
			"claim_date":      time.Time{},
			"checked_date":    time.Time{},
			"claim_sources":   "GOI",
			"description":     test.NilJsonb(),
			"claimant_id":     uint(1),
			"rating_id":       uint(1),
			"review":          "Succesfully reviewed",
			"review_tag_line": "tag line",
			"review_sources":  "TOI",
		},
	}

	t.Run("get empty list of claims", func(t *testing.T) {
		test.CheckSpaceMock(mock)
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
		claimCountQuery(mock, len(claimList))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, claimList[0]["title"], claimList[0]["slug"], claimList[0]["claim_date"], claimList[0]["checked_date"], claimList[0]["claim_sources"],
					claimList[0]["description"], claimList[0]["claimant_id"], claimList[0]["rating_id"], claimList[0]["review"], claimList[0]["review_tag_line"], claimList[0]["review_sources"], 1).
				AddRow(2, time.Now(), time.Now(), nil, claimList[1]["title"], claimList[1]["slug"], claimList[1]["claim_date"], claimList[1]["checked_date"], claimList[1]["claim_sources"],
					claimList[1]["description"], claimList[1]["claimant_id"], claimList[1]["rating_id"], claimList[1]["review"], claimList[1]["review_tag_line"], claimList[1]["review_sources"], 1))
		rating.SelectWithOutSpace(mock, rating.Data)
		claimant.SelectWithOutSpace(mock, claimant.Data)

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
		claimCountQuery(mock, len(claimList))

		mock.ExpectQuery(paginationQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(2, time.Now(), time.Now(), nil, claimList[1]["title"], claimList[1]["slug"], claimList[1]["claim_date"], claimList[1]["checked_date"], claimList[1]["claim_sources"],
					claimList[1]["description"], claimList[1]["claimant_id"], claimList[1]["rating_id"], claimList[1]["review"], claimList[1]["review_tag_line"], claimList[1]["review_sources"], 1))

		rating.SelectWithOutSpace(mock, rating.Data)
		claimant.SelectWithOutSpace(mock, claimant.Data)

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
}
