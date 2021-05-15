package page

import (
	"database/sql/driver"
	"fmt"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/core/format"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/core/tag"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"title":    "Post",
	"subtitle": "post subtitle",
	"slug":     "post",
	"status":   "draft",
	"is_page":  true,
	"excerpt":  "post excerpt",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description":   "<p>Test Description</p>",
	"is_featured":        false,
	"is_sticky":          true,
	"is_highlighted":     true,
	"featured_medium_id": uint(1),
	"published_date":     time.Now(),
	"format_id":          uint(1),
	"category_ids":       []uint{1},
	"tag_ids":            []uint{1},
	"author_ids":         []uint{1},
}
var pageData = map[string]interface{}{
	"title":    "Post",
	"subtitle": "post subtitle",
	"slug":     "post",
	"status":   "draft",
	"is_page":  true,
	"excerpt":  "post excerpt",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description": "<p>Test Description</p>",
	"is_featured":      false,
	"is_sticky":        true,
	"is_highlighted":   true,
	"format_id":        uint(1),
}

var pageList = []map[string]interface{}{
	{
		"title":    "Post 1",
		"subtitle": "post subtitle 1",
		"slug":     "post-1",
		"status":   "draft",
		"is_page":  true,
		"excerpt":  "post excerpt",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description 1"}}],"version":"2.19.0"}`),
		},
		"html_description":   "<p>Test Description 1</p>",
		"is_featured":        false,
		"is_sticky":          true,
		"is_highlighted":     true,
		"featured_medium_id": uint(1),
		"format_id":          uint(1),
	},
	{
		"title":    "Post 2",
		"subtitle": "post subtitle",
		"slug":     "post-2",
		"status":   "draft",
		"is_page":  true,
		"excerpt":  "post excerpt",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description 2"}}],"version":"2.19.0"}`),
		},
		"html_description":   "<p>Test Description 2</p>",
		"is_featured":        false,
		"is_sticky":          true,
		"is_highlighted":     true,
		"featured_medium_id": uint(1),
		"format_id":          uint(1),
	},
}

var invalidData = map[string]interface{}{
	"title": "a",
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "title", "subtitle", "slug", "status", "is_page", "excerpt", "description", "html_description", "is_featured", "is_sticky", "is_highlighted", "featured_medium_id", "format_id", "published_date", "space_id"}

var selectQuery = `SELECT (.+) FROM "posts"`

var basePath = "/core/pages"
var path = "/core/pages/{page_id}"

func slugCheckMock(mock sqlmock.Sqlmock, post map[string]interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "posts"`)).
		WithArgs(fmt.Sprint(post["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

func SelectMock(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["title"], Data["subtitle"], Data["slug"], Data["status"], Data["is_page"], Data["excerpt"], Data["description"], Data["html_description"], Data["is_featured"], Data["is_sticky"], Data["is_highlighted"], Data["featured_medium_id"], Data["format_id"], Data["published_date"], 1))
}

func pageCountQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "posts"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func preloadMock(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_categories"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows([]string{"post_id", "category_id"}).
			AddRow(1, 1))
	category.SelectWithOutSpace(mock)

	format.SelectMock(mock, 1)
	medium.SelectWithOutSpace(mock)

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_tags"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows([]string{"post_id", "tag_id"}).
			AddRow(1, 1))
	tag.SelectMock(mock, tag.Data, 1)
}

func pageAuthorInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(`INSERT INTO "post_authors"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, 1, 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
}
