package test

import (
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
)

func TestTags(t *testing.T) {
	// Setup Mock DB
	mock := SetupMockDB()

	// Start test server
	testServer := httptest.NewServer(TestRouter())
	defer testServer.Close()

	// Setup httpexpect
	e := httpexpect.New(t, testServer.URL)

	// DATA
	var tagData = map[string]interface{}{
		"name":        "Elections",
		"slug":        "elections",
		"is_featured": true,
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
		},
		"html_description": "<p>Test Description</p>",
	}

	var tagColumns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "description", "html_description", "is_featured", "space_id"}

	// tags testcases
	t.Run("get list of tag ids", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "tags"`)).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "tags"`)).
			WillReturnRows(sqlmock.NewRows(tagColumns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, tagData["name"], tagData["slug"], tagData["description"], tagData["html_description"], tagData["is_featured"], 1))

		resp := e.POST(path).
			WithJSON(Query{
				Query: `{
					tags {
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
		}, "tags")
		ExpectationsMet(t, mock)
	})

	t.Run("get tags with ids and space ids passed as parameter", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "tags"`)).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "tags"`)).
			WithArgs(1, 2, 3, 1).
			WillReturnRows(sqlmock.NewRows(tagColumns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, tagData["name"], tagData["slug"], tagData["description"], tagData["html_description"], tagData["is_featured"], 1))

		resp := e.POST(path).
			WithJSON(Query{
				Query: `{
					tags (ids:[1,2,3], spaces:[1]){
						nodes {
							id
							name
							space_id
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"nodes": []map[string]interface{}{
				{"id": "1", "name": tagData["name"], "space_id": 1},
			},
		}, "tags")
		ExpectationsMet(t, mock)
	})

	t.Run("get ascending sorted tags", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "tags"`)).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		mock.ExpectQuery(`SELECT \* FROM "tags" (.+) ORDER BY updated_at asc`).
			WillReturnRows(sqlmock.NewRows(tagColumns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, tagData["name"], tagData["slug"], tagData["description"], tagData["html_description"], tagData["is_featured"], 1))

		resp := e.POST(path).
			WithJSON(Query{
				Query: ` {
				tags(sortBy: "updated_at", sortOrder: "asc") {
					nodes {
						id
						name
						html_description
					}
				}
			}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"nodes": []map[string]interface{}{
				{"id": "1", "name": tagData["name"], "html_description": tagData["html_description"]},
			},
		}, "tags")
		ExpectationsMet(t, mock)
	})

	// tag testcases
	t.Run("get tag by id", func(t *testing.T) {
		mock.ExpectQuery(`SELECT \* FROM "tags"`).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(tagColumns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, tagData["name"], tagData["slug"], tagData["description"], tagData["html_description"], tagData["is_featured"], 1))

		resp := e.POST(path).
			WithJSON(Query{
				Query: ` {
				tag(id:1) {
						id
						name
						html_description
					}
			}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{"id": "1", "name": tagData["name"], "html_description": tagData["html_description"]}, "tag")
		ExpectationsMet(t, mock)
	})

	t.Run("get tag from particular space", func(t *testing.T) {
		mock.ExpectQuery(`SELECT \* FROM "tags"`).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(tagColumns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, tagData["name"], tagData["slug"], tagData["description"], tagData["html_description"], tagData["is_featured"], 1))

		resp := e.POST(path).
			WithHeader("space", "1").
			WithJSON(Query{
				Query: ` {
				tag(id:1) {
						id
						name
						html_description
					}
			}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{"id": "1", "name": tagData["name"], "html_description": tagData["html_description"]}, "tag")
		ExpectationsMet(t, mock)
	})

	t.Run("tag record not found", func(t *testing.T) {
		mock.ExpectQuery(`SELECT \* FROM "tags"`).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(tagColumns))

		resp := e.POST(path).
			WithHeader("space", "1").
			WithJSON(Query{
				Query: ` {
				tag(id:1) {
						id
						name
						html_description
					}
			}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, nil, "tag")
		ExpectationsMet(t, mock)
	})
}
