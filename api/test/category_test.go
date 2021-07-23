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

var categoryData map[string]interface{} = map[string]interface{}{
	"name": "Test category",
	"slug": "test-category",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description": "<p>Test Description</p>",
	"parent_id":        0,
	"medium_id":        1,
	"is_featured":      true,
	"meta_fields": postgres.Jsonb{
		RawMessage: []byte(`{"type":"description"}`),
	},
}

var categoryColumns []string = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "description", "html_description", "parent_id", "meta_fields", "medium_id", "is_featured", "space_id"}

func TestCategory(t *testing.T) {
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

	// categories testcases
	t.Run("get list of category ids", func(t *testing.T) {
		CheckSpaceMock(mock)
		CategoryCountMock(mock, 1)
		CategorySelectMock(mock)
		mediumPreloadMock(mock)

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					categories {
						nodes {
							id
							parent_id	
							description
							html_description
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"nodes": []map[string]interface{}{
				{"id": "1", "parent_id": categoryData["parent_id"], "description": categoryData["description"], "html_description": categoryData["html_description"]},
			},
		}, "categories")
		ExpectationsMet(t, mock)
	})

	t.Run("get categories with ids and space ids passed as parameter", func(t *testing.T) {
		CheckSpaceMock(mock)
		CategoryCountMock(mock, 1)
		CategorySelectMock(mock, 1, 2, 1)
		mediumPreloadMock(mock)

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					categories (ids:[1,2], spaces:[4,5]) {
						nodes {
							id
							space_id
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"nodes": []map[string]interface{}{
				{"id": "1", "space_id": 1},
			},
		}, "categories")
		ExpectationsMet(t, mock)
	})

	t.Run("get categories sorted by updated_at", func(t *testing.T) {
		CheckSpaceMock(mock)
		CategoryCountMock(mock, 1)
		mock.ExpectQuery(`SELECT \* FROM "categories" (.+) ORDER BY updated_at asc`).
			WillReturnRows(sqlmock.NewRows(categoryColumns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, categoryData["name"], categoryData["slug"], categoryData["description"], categoryData["html_description"], categoryData["parent_id"], categoryData["meta_fields"], categoryData["medium_id"], categoryData["is_featured"], 1))
		mediumPreloadMock(mock)

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					categories (sortBy:"updated_at", sortOrder:"asc") {
						nodes {
							id
							space_id
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"nodes": []map[string]interface{}{
				{"id": "1", "space_id": 1},
			},
		}, "categories")
		ExpectationsMet(t, mock)
	})

	// category testcases
	t.Run("get category by id", func(t *testing.T) {
		CheckSpaceMock(mock)
		CategorySelectMock(mock, 1, 1)
		mediumPreloadMock(mock)

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					category (id:1) {
						id
						medium {
							id
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"id": "1", "medium": map[string]interface{}{"id": "1"},
		}, "category")
		ExpectationsMet(t, mock)
	})

	t.Run("category record not found", func(t *testing.T) {
		CheckSpaceMock(mock)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(categoryColumns))

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					category (id:1) {
						id
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, nil, "category")
		ExpectationsMet(t, mock)
	})

}

func CategorySelectMock(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(categoryColumns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, categoryData["name"], categoryData["slug"], categoryData["description"], categoryData["html_description"], categoryData["parent_id"], categoryData["meta_fields"], categoryData["medium_id"], categoryData["is_featured"], 1))
}

func CategoryCountMock(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "categories"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func mediumPreloadMock(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
}
