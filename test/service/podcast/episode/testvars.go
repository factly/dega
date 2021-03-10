package episode

import (
	"database/sql/driver"
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
	"title": "Test Episode",
	"slug":  "test-episode",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"type":"description"}`),
	},
	"season":         1,
	"episode":        1,
	"audio_url":      "testaudio.com",
	"published_date": time.Now(),
	"medium_id":      1,
}

var invalidData = map[string]interface{}{
	"title": "a",
}

var Columns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "title", "slug", "season", "episode", "audio_url", "description", "published_date", "medium_id", "space_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "episodes"`)

func SelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["title"], Data["slug"], Data["season"], Data["episode"], Data["audio_url"], Data["description"], Data["published_date"], Data["medium_id"], 1))
}
