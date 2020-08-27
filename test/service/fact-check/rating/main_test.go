package rating

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Rating = map[string]interface{}{
	"name":          "True",
	"slug":          "true",
	"description":   "article is validated",
	"numeric_value": 5,
	"medium_id":     uint(1),
}

var dataWithoutSlug = map[string]interface{}{
	"name":          "True",
	"slug":          "",
	"description":   "article is validated",
	"numeric_value": 5,
	"medium_id":     uint(1),
}

func nilJsonb() postgres.Jsonb {
	ba, _ := json.Marshal(nil)
	return postgres.Jsonb{
		RawMessage: ba,
	}
}

var Medium = map[string]interface{}{
	"name":        "Test Medium",
	"slug":        "test-medium",
	"type":        "testtype",
	"title":       "Test Title",
	"description": "Test Description",
	"caption":     "Test Caption",
	"alt_text":    "Test alt text",
	"file_size":   100,
	"url":         nilJsonb(),
	"dimensions":  "testdims",
}

var invalidData = map[string]interface{}{
	"name":          "a",
	"numeric_value": 0,
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "medium_id", "description", "numeric_value", "space_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "ratings"`)
var deleteQuery = regexp.QuoteMeta(`UPDATE "ratings" SET "deleted_at"=`)
var paginationQuery = `SELECT \* FROM "ratings" (.+) LIMIT 1 OFFSET 1`

var basePath = "/fact-check/ratings"
var path = "/fact-check/ratings/{rating_id}"

func slugCheckMock(mock sqlmock.Sqlmock, rating map[string]interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "ratings"`)).
		WithArgs(fmt.Sprint(rating["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

func ratingInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	MediumSelectWithSpace(mock)
	mock.ExpectQuery(`INSERT INTO "ratings"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Rating["name"], Rating["slug"], Rating["description"], Rating["numeric_value"], Rating["medium_id"], 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
	mock.ExpectCommit()
}

func ratingInsertError(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(MediumCols))
	mock.ExpectRollback()
}

func ratingUpdateMock(mock sqlmock.Sqlmock, rating map[string]interface{}, err error) {
	mock.ExpectBegin()
	if err != nil {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(MediumCols))
		mock.ExpectRollback()
	} else {
		MediumSelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"ratings\" SET (.+)  WHERE (.+) \"ratings\".\"id\" = `).
			WithArgs(rating["description"], rating["medium_id"], rating["name"], rating["numeric_value"], rating["slug"], test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		ratingSelectWithOutSpace(mock, rating)
		mock.ExpectCommit()
	}

}

func ratingSelectWithOutSpace(mock sqlmock.Sqlmock, rating map[string]interface{}) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, rating["name"], rating["slug"], rating["medium_id"], rating["description"], rating["numeric_value"], 1))

	// Preload medium
	MediumSelectWithOutSpace(mock)
}

func ratingSelectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Rating["name"], Rating["slug"], Rating["medium_id"], Rating["description"], Rating["numeric_value"], 1))
}

//check rating exits or not
func recordNotFoundMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(100, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

// check rating associated with any claim before deleting
func ratingClaimExpect(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "claims"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func ratingCountQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "ratings"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

var MediumCols = []string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "type", "title", "description", "caption", "alt_text", "file_size", "url", "dimensions", "space_id"}

func MediumSelectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(MediumCols).
			AddRow(1, time.Now(), time.Now(), nil, Medium["name"], Medium["slug"], Medium["type"], Medium["title"], Medium["description"], Medium["caption"], Medium["alt_text"], Medium["file_size"], Medium["url"], Medium["dimensions"], 1))

}

func MediumSelectWithOutSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(MediumCols).
			AddRow(1, time.Now(), time.Now(), nil, Medium["name"], Medium["slug"], Medium["type"], Medium["title"], Medium["description"], Medium["caption"], Medium["alt_text"], Medium["file_size"], Medium["url"], Medium["dimensions"], 1))

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
