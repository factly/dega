package space

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
	"title": "Test Title",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"type":"description"}`),
	},
	"status":     "pending",
	"space_id":   1,
	"posts":      10,
	"episodes":   10,
	"podcast":    true,
	"media":      10,
	"fact_check": true,
}

var requestList = []map[string]interface{}{
	{
		"title": "Test Title 1",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"type":"description1"}`),
		},
		"status":     "pending",
		"space_id":   1,
		"posts":      10,
		"episodes":   10,
		"podcast":    true,
		"media":      10,
		"fact_check": true,
	},
	{
		"title": "Test Title 2",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"type":"description2"}`),
		},
		"status":     "pending",
		"space_id":   1,
		"posts":      20,
		"episodes":   20,
		"podcast":    true,
		"media":      20,
		"fact_check": true,
	},
}

var invalidData = map[string]interface{}{
	"title": "aa",
}

var Columns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "title", "description", "status", "media", "posts", "episodes", "podcast", "fact_check", "space_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "space_permission_requests"`)
var countQuery = regexp.QuoteMeta(`SELECT count(1) FROM "space_permission_requests"`)

var basePath = "/core/requests/spaces"
var path = "/core/requests/spaces/{request_id}"
var approvePath = "/core/requests/spaces/{request_id}/approve"
var rejectPath = "/core/requests/spaces/{request_id}/reject"
var myPath = "/core/requests/spaces/my"

func SelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["title"], Data["description"], Data["status"], Data["media"], Data["posts"], Data["episodes"], Data["podcast"], Data["fact_check"], Data["space_id"]))
}
