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

var claimantData = map[string]interface{}{
	"name": "TOI",
	"slug": "toi",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description": "<p>Test Description</p>",
	"tag_line":         "sample tag line",
	"medium_id":        uint(1),
	"meta_fields": postgres.Jsonb{
		RawMessage: []byte(`{"type": "meta_fields"}`),
	},
}

var claimantColumns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "medium_id", "description", "html_description", "tag_line", "meta_fields", "space_id"}

func TestClaimants(t *testing.T) {
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

	// claimant testcases
	t.Run("get list of claimants", func(t *testing.T) {
		CheckSpaceMock(mock)
		ClaimantCountMock(mock, 1)
		ClaimantSelectMock(mock)
		mediumPreloadMock(mock)
		mediumPreloadMock(mock)

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					claimants {
						nodes {
							id
							space_id
							description
							html_description	
							medium {
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
				{"id": "1", "space_id": 1, "description": claimantData["description"], "html_description": claimantData["html_description"], "medium": map[string]interface{}{"id": "1"}},
			},
		}, "claimants")
		ExpectationsMet(t, mock)
	})

	t.Run("get claimant ids sorted by updated_by in ascending order from spaces given as paramter", func(t *testing.T) {
		CheckSpaceMock(mock)
		ClaimantCountMock(mock, 1)

		mock.ExpectQuery(`SELECT \* FROM "claimants" (.+) ORDER BY updated_at asc`).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(claimantColumns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, claimantData["name"], claimantData["slug"], claimantData["medium_id"], claimantData["description"], claimantData["html_description"], claimantData["tag_line"], claimantData["meta_fields"], 1))
		mediumPreloadMock(mock)

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					claimants (sortBy:"updated_at", sortOrder:"asc"){
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
		}, "claimants")
		ExpectationsMet(t, mock)
	})
}

func ClaimantSelectMock(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "claimants"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(claimantColumns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, claimantData["name"], claimantData["slug"], claimantData["medium_id"], claimantData["description"], claimantData["html_description"], claimantData["tag_line"], claimantData["meta_fields"], 1))
}

func ClaimantCountMock(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "claimants"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}
