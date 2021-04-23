package podcast

import (
	"database/sql/driver"
	"fmt"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"title": "Test Podcast",
	"slug":  "test-podcast",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description":    "<p>Test Description</p>",
	"language":            "english",
	"primary_category_id": 1,
	"medium_id":           1,
	"category_ids":        []uint{1},
}

var resData = map[string]interface{}{
	"title": "Test Podcast",
	"slug":  "test-podcast",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description":    "<p>Test Description</p>",
	"language":            "english",
	"primary_category_id": 1,
	"medium_id":           1,
}

var podcastList = []map[string]interface{}{
	{
		"title": "Test Podcast 1",
		"slug":  "test-podcast-1",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description 1"}}],"version":"2.19.0"}`),
		},
		"html_description":    "<p>Test Description 1</p>",
		"language":            "english",
		"primary_category_id": 1,
		"medium_id":           1,
	},
	{
		"title": "Test Podcast 2",
		"slug":  "test-podcast-2",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description 2"}}],"version":"2.19.0"}`),
		},
		"html_description":    "<p>Test Description 2</p>",
		"language":            "english",
		"primary_category_id": 1,
		"medium_id":           1,
	},
}

var invalidData = map[string]interface{}{
	"title": "a",
}

var Columns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "title", "slug", "description", "html_description", "language", "primary_category_id", "medium_id", "space_id"}

var selectQuery = `SELECT (.+) FROM "podcasts"`
var countQuery = regexp.QuoteMeta(`SELECT count(1) FROM "podcasts"`)

var basePath = "/podcast"
var path = "/podcast/{podcast_id}"

func SelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["title"], Data["slug"], Data["description"], Data["html_description"], Data["language"], Data["primary_category_id"], Data["medium_id"], 1))
}

func PodcastCategorySelect(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "podcast_categories"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"podcast_id", "category_id"}).AddRow(1, 1))

	category.SelectWithOutSpace(mock)
}

func slugCheckMock(mock sqlmock.Sqlmock, podcast map[string]interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "podcasts"`)).
		WithArgs(fmt.Sprint(podcast["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows(Columns))
}

func podcastCategoriesInsert(mock sqlmock.Sqlmock) {
	medium.SelectWithSpace(mock)
	mock.ExpectQuery(`INSERT INTO "categories"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["is_featured"], 1, category.Data["meta_fields"], sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.
			NewRows([]string{"medium_id", "id", "parent_id"}).
			AddRow(1, 1, 1))
	mock.ExpectExec(`INSERT INTO "podcast_categories"`).
		WithArgs(1, 1).
		WillReturnResult(driver.ResultNoRows)
}
