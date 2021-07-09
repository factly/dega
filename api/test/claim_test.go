package test

import (
	"database/sql/driver"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

var claimData = map[string]interface{}{
	"claim":        "Claim",
	"slug":         "claim",
	"claim_date":   time.Now(),
	"checked_date": time.Now(),
	"claim_sources": postgres.Jsonb{
		RawMessage: []byte(`{"type":"claim sources"}`),
	},
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description": "<p>Test Description</p>",
	"claimant_id":      uint(1),
	"rating_id":        uint(1),
	"fact":             "Test Fact",
	"review_sources": postgres.Jsonb{
		RawMessage: []byte(`{"type":"review sources"}`),
	},
}

var claimColumns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "claim", "slug", "claim_date", "checked_date", "claim_sources", "description", "html_description", "claimant_id", "rating_id", "fact", "review_sources", "space_id"}

func TestClaim(t *testing.T) {
	// Setup Mock DB
	mock := SetupMockDB()
	KavachMockServer()

	// Start test server
	testServer := httptest.NewServer(TestRouter())
	defer testServer.Close()

	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer gock.Off()

	// Setup httpexpect
	e := httpexpect.New(t, testServer.URL)

	// claim testcases
	t.Run("get list of claims", func(t *testing.T) {
		CheckSpaceMock(mock)
		ClaimCountMock(mock, 1)
		ClaimSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					claims {
						nodes {
							id
							space_id
							description
							html_description	
							claim_sources
							fact
							review_sources
							rating {
								id
							}
							claimant {
								id
							}	
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"nodes": []map[string]interface{}{
				{"id": "1", "space_id": 1, "description": claimData["description"], "html_description": claimData["html_description"], "claim_sources": claimData["claim_sources"], "fact": claimData["fact"], "review_sources": claimData["review_sources"], "rating": map[string]interface{}{"id": "1"}, "claimant": map[string]interface{}{"id": "1"}},
			},
		}, "claims")
		ExpectationsMet(t, mock)
	})

	t.Run("get claim ids sorted by updated_by in ascending order from spaces given as paramter", func(t *testing.T) {
		CheckSpaceMock(mock)
		ClaimCountMock(mock, 1)

		mock.ExpectQuery(`SELECT \* FROM "claims" (.+) ORDER BY updated_at asc`).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(claimColumns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, claimData["title"], claimData["slug"], claimData["claim_date"], claimData["checked_date"], claimData["claim_sources"], claimData["description"], claimData["html_description"], claimData["claimant_id"], claimData["rating_id"], claimData["review"], claimData["review_sources"], 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					claims(sortBy:"updated_at", sortOrder:"asc") {
						nodes {
							id
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"nodes": []map[string]interface{}{
				{"id": "1"},
			},
		}, "claims")
		ExpectationsMet(t, mock)
	})

	t.Run("get claims filtered by ratings and claims", func(t *testing.T) {
		CheckSpaceMock(mock)
		ClaimCountMock(mock, 1)

		mock.ExpectQuery(`SELECT \* FROM "claims" (.+)claims.rating_id IN \(2,3\) AND claims.claimant_id IN \(4,5\)`).
			WillReturnRows(sqlmock.NewRows(claimColumns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, claimData["title"], claimData["slug"], claimData["claim_date"], claimData["checked_date"], claimData["claim_sources"], claimData["description"], claimData["html_description"], claimData["claimant_id"], claimData["rating_id"], claimData["review"], claimData["review_sources"], 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					claims(ratings:[2,3], claimants:[4,5]) {
						nodes {
							id
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"nodes": []map[string]interface{}{
				{"id": "1"},
			},
		}, "claims")
		ExpectationsMet(t, mock)
	})
}

func ClaimSelectMock(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "claims"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(claimColumns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, claimData["claim"], claimData["slug"], claimData["claim_date"], claimData["checked_date"], claimData["claim_sources"], claimData["description"], claimData["html_description"], claimData["claimant_id"], claimData["rating_id"], claimData["fact"], claimData["review_sources"], 1))
}

func ClaimCountMock(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "claims"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}
