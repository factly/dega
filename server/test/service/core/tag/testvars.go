package tag

import (
	"database/sql/driver"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"name":        "Elections",
	"slug":        "elections",
	"is_featured": true,
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description": "<p>Test Description</p>",
}

var invalidData = map[string]interface{}{
	"name": "a",
}

var Columns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "description", "html_description", "is_featured", "space_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "tags"`)
var deleteQuery = regexp.QuoteMeta(`UPDATE "tags" SET "deleted_at"=`)
var paginationQuery = `SELECT \* FROM "tags" (.+) LIMIT 1 OFFSET 1`

var basePath = "/core/tags"
var path = "/core/tags/{tag_id}"

func slugCheckMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "tags"`)).
		WithArgs(fmt.Sprint(Data["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "space_id", "name", "slug"}))
}

func tagInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectQuery(`INSERT INTO "tags"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["name"], Data["slug"], Data["description"], Data["html_description"], Data["is_featured"], 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
}

//check tag exits or not
func recordNotFoundMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 100).
		WillReturnRows(sqlmock.NewRows(Columns))
}

func sameNameCount(mock sqlmock.Sqlmock, count int, name interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "tags"`)).
		WithArgs(1, strings.ToLower(name.(string))).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func SelectMock(mock sqlmock.Sqlmock, tag map[string]interface{}, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, tag["name"], tag["slug"], tag["description"], tag["html_description"], tag["is_featured"], 1))
}

// check tag associated with any post before deleting
func tagPostExpect(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "posts" JOIN "post_tags"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func tagUpdateMock(mock sqlmock.Sqlmock, tag map[string]interface{}) {
	mock.ExpectBegin()
	mock.ExpectExec(`UPDATE \"tags\"`).
		WithArgs(test.AnyTime{}, Data["is_featured"], 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectExec(`UPDATE \"tags\"`).
		WithArgs(test.AnyTime{}, 1, tag["name"], tag["slug"], tag["description"], tag["html_description"], 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	SelectMock(mock, tag, 1, 1)
}

func tagCountQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "tags"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}
