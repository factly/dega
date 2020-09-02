package rating

import (
	"fmt"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"name":          "True",
	"slug":          "true",
	"description":   "article is validated",
	"numeric_value": 5,
	"medium_id":     uint(1),
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
	medium.SelectWithSpace(mock)
	mock.ExpectQuery(`INSERT INTO "ratings"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["description"], Data["numeric_value"], Data["medium_id"], 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
}

func ratingInsertError(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	medium.EmptyRowMock(mock)
	mock.ExpectRollback()
}

func ratingUpdateMock(mock sqlmock.Sqlmock, rating map[string]interface{}, err error) {
	mock.ExpectBegin()
	if err != nil {
		medium.EmptyRowMock(mock)
	} else {
		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"ratings\" SET (.+)  WHERE (.+) \"ratings\".\"id\" = `).
			WithArgs(rating["description"], rating["medium_id"], rating["name"], rating["numeric_value"], rating["slug"], test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		SelectWithOutSpace(mock, rating)
	}

}

func SelectWithOutSpace(mock sqlmock.Sqlmock, rating map[string]interface{}) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, rating["name"], rating["slug"], rating["medium_id"], rating["description"], rating["numeric_value"], 1))

	// Preload medium
	medium.SelectWithOutSpace(mock)
}

func SelectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["medium_id"], Data["description"], Data["numeric_value"], 1))
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

func EmptyRowMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}
