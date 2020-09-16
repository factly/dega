package tag

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"name": "Elections",
	"slug": "elections",
}

var invalidData = map[string]interface{}{
	"name": "a",
}

var Columns = []string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "space_id"}

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
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], "", 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
}

//check tag exits or not
func recordNotFoundMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(100, 1).
		WillReturnRows(sqlmock.NewRows(Columns))
}

func sameNameCount(mock sqlmock.Sqlmock, count int, name interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "tags"`)).
		WithArgs(1, strings.ToLower(name.(string))).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func SelectWithSpaceMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], 1))
}

func SelectWithOutSpace(mock sqlmock.Sqlmock, tag map[string]interface{}) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, tag["name"], tag["slug"], 1))
}

// check tag associated with any post before deleting
func tagPostExpect(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "posts" INNER JOIN "post_tags"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func tagUpdateMock(mock sqlmock.Sqlmock, tag map[string]interface{}) {
	mock.ExpectBegin()
	mock.ExpectExec(`UPDATE \"tags\" SET (.+)  WHERE (.+) \"tags\".\"id\" = `).
		WithArgs(tag["name"], tag["slug"], test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	SelectWithOutSpace(mock, tag)
}

func tagCountQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "tags"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}
