package medium

import (
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/jinzhu/gorm/dialects/postgres"
)

func nilJsonb() postgres.Jsonb {
	ba, _ := json.Marshal(nil)
	return postgres.Jsonb{
		RawMessage: ba,
	}
}

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"name":        "Image",
	"slug":        "image",
	"type":        "jpg",
	"title":       "Sample image",
	"description": "desc",
	"caption":     "sample",
	"alt_text":    "sample",
	"file_size":   100,
	"url": postgres.Jsonb{
		RawMessage: []byte(`{"raw":"http://testimage.com/test.jpg"}`),
	},
	"dimensions": "testdims",
}

var invalidData = map[string]interface{}{
	"name": "a",
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "type", "title", "description", "caption", "alt_text", "file_size", "url", "dimensions", "space_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "media"`)
var deleteQuery = regexp.QuoteMeta(`UPDATE "media" SET "deleted_at"=`)
var paginationQuery = `SELECT \* FROM "media" (.+) LIMIT 1 OFFSET 1`

var basePath = "/core/media"
var path = "/core/media/{medium_id}"

func slugCheckMock(mock sqlmock.Sqlmock, medium map[string]interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "media"`)).
		WithArgs(fmt.Sprint(medium["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

//check medium exits or not
func recordNotFoundMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(100, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

func mediumInsertError(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectQuery(`INSERT INTO "media"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["type"], Data["title"], Data["description"], Data["caption"], Data["alt_text"], Data["file_size"], Data["url"], Data["dimensions"], 1).
		WillReturnError(errors.New(`pq: insert or update on table "medium" violates foreign key constraint "media_space_id_spaces_id_foreign"`))
	mock.ExpectRollback()
}

func mediumInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectQuery(`INSERT INTO "media"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["type"], Data["title"], Data["description"], Data["caption"], Data["alt_text"], Data["file_size"], Data["url"], Data["dimensions"], 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
}

func mediumUpdateMock(mock sqlmock.Sqlmock, medium map[string]interface{}, err error) {
	mock.ExpectBegin()
	if err != nil {
		mock.ExpectExec(`UPDATE \"media\" SET (.+)  WHERE (.+) \"media\".\"id\" = `).
			WithArgs(medium["alt_text"], medium["caption"], medium["description"], medium["dimensions"], medium["file_size"], medium["name"], medium["slug"], medium["title"], medium["type"], test.AnyTime{}, medium["url"], 1).
			WillReturnError(errors.New("update failed"))
	} else {
		mock.ExpectExec(`UPDATE \"media\" SET (.+)  WHERE (.+) \"media\".\"id\" = `).
			WithArgs(medium["alt_text"], medium["caption"], medium["description"], medium["dimensions"], medium["file_size"], medium["name"], medium["slug"], medium["title"], medium["type"], test.AnyTime{}, medium["url"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
	}

}

func mediumDeleteMock(mock sqlmock.Sqlmock) {
	mediumPostExpect(mock, 0)
	mediumCategoryExpect(mock, 0)
	mediumSpaceExpect(mock, 0)
	mediumRatingExpect(mock, 0)
	mediumClaimantExpect(mock, 0)

	mock.ExpectBegin()
	mock.ExpectExec(deleteQuery).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
}

func SelectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["type"], Data["title"], Data["description"], Data["caption"], Data["alt_text"], Data["file_size"], Data["url"], Data["dimensions"], 1))

}

func SelectWithOutSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["type"], Data["title"], Data["description"], Data["caption"], Data["alt_text"], Data["file_size"], Data["url"], Data["dimensions"], 1))
}

func EmptyRowMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

func countQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "media"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

// check medium associated with any post before deleting
func mediumPostExpect(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "posts"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

// check medium associated with any rating before deleting
func mediumRatingExpect(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "ratings"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

// check medium associated with any claimant before deleting
func mediumClaimantExpect(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "claimants"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

// check medium associated with any category before deleting
func mediumCategoryExpect(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "categories"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

// check medium associated with any space before deleting
func mediumSpaceExpect(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "spaces"`)).
		WithArgs(1, 1, 1, 1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}
