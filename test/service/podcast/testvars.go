package podcast

import (
	"database/sql/driver"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/podcast/episode"
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
		RawMessage: []byte(`{"type":"description"}`),
	},
	"language":            "english",
	"primary_category_id": 1,
	"medium_id":           1,
	"category_ids":        []uint{1},
	"episode_ids":         []uint{1},
}

var podcastList = []map[string]interface{}{
	{
		"title": "Test Podcast 1",
		"slug":  "test-podcast-1",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"type":"description1"}`),
		},
		"language":            "english",
		"primary_category_id": 1,
		"medium_id":           1,
	},
	{
		"title": "Test Podcast 2",
		"slug":  "test-podcast-2",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"type":"description2"}`),
		},
		"language":            "english",
		"primary_category_id": 1,
		"medium_id":           1,
	},
}

var invalidData = map[string]interface{}{
	"title": "a",
}

var Columns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "title", "slug", "description", "language", "primary_category_id", "medium_id", "space_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "podcasts"`)
var countQuery = regexp.QuoteMeta(`SELECT count(1) FROM "podcasts"`)
var deleteQuery = regexp.QuoteMeta(`UPDATE "podcasts" SET "deleted_at"=`)

var basePath = "/podcast/podcasts"
var path = "/podcast/podcasts/{podcast_id}"

func SelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["title"], Data["slug"], Data["description"], Data["language"], Data["primary_category_id"], Data["medium_id"], 1))
}

func PodcastCategorySelect(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "podcast_categories"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"podcast_id", "category_id"}).AddRow(1, 1))

	category.SelectWithOutSpace(mock)
}

func PodcastEpisodeSelect(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "podcast_episodes"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"podcast_id", "episode_id"}).AddRow(1, 1))

	episode.SelectQuery(mock)
}
