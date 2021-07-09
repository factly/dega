package organisation

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
	"status":          "pending",
	"organisation_id": 1,
	"spaces":          10,
}

var requestList = []map[string]interface{}{
	{
		"title": "Test Title 1",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"type":"description1"}`),
		},
		"status":          "approved",
		"organisation_id": 1,
		"spaces":          10,
	},
	{
		"title": "Test Title 2",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"type":"description2"}`),
		},
		"status":          "pending",
		"organisation_id": 1,
		"spaces":          20,
	},
}

var invalidData = map[string]interface{}{
	"title": "aa",
}

var Columns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "title", "description", "status", "organisation_id", "spaces"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "organisation_permission_requests"`)
var countQuery = regexp.QuoteMeta(`SELECT count(*) FROM "organisation_permission_requests"`)

var basePath = "/core/requests/organisations"
var path = "/core/requests/organisations/{request_id}"
var approvePath = "/core/requests/organisations/{request_id}/approve"
var rejectPath = "/core/requests/organisations/{request_id}/reject"
var myPath = "/core/requests/organisations/my"

func SelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["title"], Data["description"], Data["status"], Data["organisation_id"], Data["spaces"]))
}
