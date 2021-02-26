package menu

import (
	"database/sql/driver"
	"fmt"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"name": "Elections",
	"slug": "elections",
	"menu": postgres.Jsonb{
		RawMessage: []byte(`{"item1":"description"}`),
	},
}

var menulist = []map[string]interface{}{
	{
		"name": "Elections",
		"slug": "elections",
		"menu": postgres.Jsonb{
			RawMessage: []byte(`{"item1":"description1"}`),
		},
	},
	{
		"name": "India",
		"slug": "india",
		"menu": postgres.Jsonb{
			RawMessage: []byte(`{"item2":"description2"}`),
		},
	},
}

var invalidData = map[string]interface{}{
	"name": "a",
}

var Columns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "menu", "space_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "menus"`)
var deleteQuery = regexp.QuoteMeta(`UPDATE "menus" SET "deleted_at"=`)

var basePath = "/core/menus"
var path = "/core/menus/{menu_id}"

func SelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["name"], Data["slug"], Data["menu"], 1))
}

func slugCheckMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "menus"`)).
		WithArgs(fmt.Sprint(Data["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "space_id", "name", "slug"}))
}
