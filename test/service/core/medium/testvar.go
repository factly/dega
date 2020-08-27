package medium

import (
	"encoding/json"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var Data = map[string]interface{}{
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

func nilJsonb() postgres.Jsonb {
	ba, _ := json.Marshal(nil)
	return postgres.Jsonb{
		RawMessage: ba,
	}
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "type", "title", "description", "caption", "alt_text", "file_size", "url", "dimensions", "space_id"}

func SelectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["type"], Data["title"], Data["description"], Data["caption"], Data["alt_text"], Data["file_size"], Data["url"], Data["dimensions"], 1))

}

func SelectWithOutSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["type"], Data["title"], Data["description"], Data["caption"], Data["alt_text"], Data["file_size"], Data["url"], Data["dimensions"], 1))
}

func EmptyRowMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}
