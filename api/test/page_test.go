package test

import (
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestPages(t *testing.T) {
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

	// posts testcases
	t.Run("get list of page ids", func(t *testing.T) {
		CheckSpaceMock(mock)
		PostCountMock(mock, 1)
		PostSelectMock(mock, true, 1)

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					pages {
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
		}, "pages")
		ExpectationsMet(t, mock)
	})

	t.Run("get list of pages in ascending order of slug", func(t *testing.T) {
		CheckSpaceMock(mock)
		PostCountMock(mock, 1)

		mock.ExpectQuery(`SELECT \* FROM "posts" (.+) ORDER BY slug asc`).
			WithArgs(true, 1).
			WillReturnRows(sqlmock.NewRows(postColumns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, postData["title"], postData["subtitle"], postData["slug"], postData["status"], postData["page"], postData["excerpt"], postData["description"], postData["html_description"], postData["is_featured"], postData["is_sticky"], postData["is_highlighted"], postData["featured_medium_id"], postData["format_id"], postData["published_date"], postData["schemas"], postData["meta"], postData["header_code"], postData["footer_code"], postData["meta_fields"], 1))

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
				pages(sortBy: "slug", sortOrder: "asc") {
						nodes {
							id
							title
							html_description
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"nodes": []map[string]interface{}{
				{"id": "1", "title": postData["title"], "html_description": postData["html_description"]},
			},
		}, "pages")
		ExpectationsMet(t, mock)
	})

	t.Run("fetch a page by id from a space", func(t *testing.T) {
		CheckSpaceMock(mock)
		PostSelectMock(mock, 1, 1, true)

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
				page(id:1){
						id
						title
						description
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{"id": "1", "title": postData["title"], "description": postData["description"]}, "page")
		ExpectationsMet(t, mock)
	})
}
