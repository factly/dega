package space

import (
	"database/sql/driver"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"space_id":   1,
	"fact_check": true,
	"media":      1,
	"posts":      1,
	"podcast":    true,
	"episodes":   1,
}

var invalidData = map[string]interface{}{
	"fact_check": 1,
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "space_id", "fact_check", "media", "posts", "podcast", "episodes"}

var selectQuery = `SELECT (.+) FROM \"space_permissions\"`
var countQuery = regexp.QuoteMeta(`SELECT count(*) FROM "space_permissions"`)

var basePath = "/core/permissions/spaces"
var path = "/core/permissions/spaces/{permission_id}"
var mypath = "/core/permissions/spaces/my"

func SelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["space_id"], Data["fact_check"], Data["media"], Data["posts"], Data["podcast"], Data["episodes"]))
}
