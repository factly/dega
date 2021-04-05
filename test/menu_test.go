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
)

var menuData = map[string]interface{}{
	"name": "Elections",
	"slug": "elections",
	"menu": postgres.Jsonb{
		RawMessage: []byte(`{"item1":"description"}`),
	},
}

var menuColumns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "menu", "space_id"}

func TestMenu(t *testing.T) {
	// Setup Mock DB
	mock := SetupMockDB()

	// Start test server
	testServer := httptest.NewServer(TestRouter())
	defer testServer.Close()

	// Setup httpexpect
	e := httpexpect.New(t, testServer.URL)

	// menu testcases
	t.Run("get menu list", func(t *testing.T) {
		MenuCountMock(mock, 1)
		MenuSelectMenu(mock)

		resp := e.POST(path).
			WithJSON(Query{
				Query: `{
					menu {
						nodes {
							id
							menu
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"nodes": []map[string]interface{}{
				{"id": "1", "menu": menuData["menu"]},
			},
		}, "menu")
		ExpectationsMet(t, mock)
	})
}

func MenuSelectMenu(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "menus"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(menuColumns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, menuData["name"], menuData["slug"], menuData["menu"], 1))
}

func MenuCountMock(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "menus"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}
