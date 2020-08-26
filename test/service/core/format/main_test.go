package format

import (
	"fmt"
	"os"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"gopkg.in/h2non/gock.v1"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var data = map[string]interface{}{
	"name": "Article",
	"slug": "article",
}

var dataWithoutSlug = map[string]interface{}{
	"name": "Article",
	"slug": "",
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
		WithArgs(fmt.Sprint(data["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "space_id", "name", "slug"}))
}

func formatInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectQuery(`INSERT INTO "formats"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, data["name"], data["slug"], "", 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
	mock.ExpectCommit()
}

//check format exits or not
func recordNotFoundMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(100, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

func formatSelectMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, data["name"], data["slug"]))
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
	mock.ExpectCommit()
}

func formatCountQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "formats"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func TestMain(m *testing.M) {

	test.SetEnv()

	// Mock kavach server and allowing persisted external traffic
	defer gock.Disable()
	test.MockServer()
	defer gock.DisableNetworking()

	exitValue := m.Run()

	os.Exit(exitValue)
}
