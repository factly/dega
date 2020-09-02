package claimant

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
	"name":        "TOI",
	"slug":        "toi",
	"description": "article is validated",
	"tag_line":    "sample tag line",
	"medium_id":   uint(1),
}

var invalidData = map[string]interface{}{
	"name": "a",
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "medium_id", "description", "tag_line", "space_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "claimants"`)
var deleteQuery = regexp.QuoteMeta(`UPDATE "claimants" SET "deleted_at"=`)
var paginationQuery = `SELECT \* FROM "claimants" (.+) LIMIT 1 OFFSET 1`

var basePath = "/fact-check/claimants"
var path = "/fact-check/claimants/{claimant_id}"

func slugCheckMock(mock sqlmock.Sqlmock, claimant map[string]interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "claimants"`)).
		WithArgs(fmt.Sprint(claimant["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

func claimantInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	medium.SelectWithSpace(mock)
	mock.ExpectQuery(`INSERT INTO "claimants"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["description"], Data["tag_line"], Data["medium_id"], 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
}

func claimantInsertError(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	medium.EmptyRowMock(mock)
	mock.ExpectRollback()
}

func claimantUpdateMock(mock sqlmock.Sqlmock, claimant map[string]interface{}, err error) {
	mock.ExpectBegin()
	if err != nil {
		medium.EmptyRowMock(mock)
	} else {
		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"claimants\" SET (.+)  WHERE (.+) \"claimants\".\"id\" = `).
			WithArgs(claimant["description"], claimant["medium_id"], claimant["name"], claimant["slug"], claimant["tag_line"], test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		SelectWithOutSpace(mock, claimant)
	}

}

func SelectWithOutSpace(mock sqlmock.Sqlmock, claimant map[string]interface{}) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, claimant["name"], claimant["slug"], claimant["medium_id"], claimant["description"], claimant["tag_line"], 1))

	// Preload medium
	medium.SelectWithOutSpace(mock)
}

func SelectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["medium_id"], Data["description"], Data["tag_line"], 1))
}

//check claimant exits or not
func recordNotFoundMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(100, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

// check claimant associated with any claim before deleting
func claimantClaimExpect(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "claims"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func claimantCountQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "claimants"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func EmptyRowMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}
