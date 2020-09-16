package format

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
	"name": "Fact Check",
	"slug": "fact-check",
}

var invalidData = map[string]interface{}{
	"name": "a",
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "formats"`)
var deleteQuery = regexp.QuoteMeta(`UPDATE "formats" SET "deleted_at"=`)
var paginationQuery = `SELECT \* FROM "formats" (.+) LIMIT 1 OFFSET 1`

var basePath = "/core/formats"
var path = "/core/formats/{format_id}"

func slugCheckMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "formats"`)).
		WithArgs(fmt.Sprint(Data["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "space_id", "name", "slug"}))
}

func formatInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectQuery(`INSERT INTO "formats"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], "", 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
}

func sameNameCount(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "formats"`)).
		WithArgs(1, strings.ToLower(Data["name"].(string))).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func sameNameFind(mock sqlmock.Sqlmock, found bool) {
	mx := mock.ExpectQuery(selectQuery).
		WithArgs(1, strings.ToLower(Data["name"].(string)))
	if found {
		mx.WillReturnRows(sqlmock.NewRows(columns).
			AddRow(2, time.Now(), time.Now(), nil, Data["name"], Data["slug"]))
	} else {
		mx.WillReturnRows(sqlmock.NewRows(columns))
	}
}

//check format exits or not
func recordNotFoundMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(100, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

func SelectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"]))
}

func SelectWithOutSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"]))
}

// check whether format is associated with any post before deleting
func formatPostExpect(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "posts"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func formatUpdateMock(mock sqlmock.Sqlmock, format map[string]interface{}) {
	mock.ExpectBegin()
	mock.ExpectExec(`UPDATE \"formats\" SET (.+)  WHERE (.+) \"formats\".\"id\" = `).
		WithArgs(format["name"], format["slug"], test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
}

func formatCountQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "formats"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func EmptyRowMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}
