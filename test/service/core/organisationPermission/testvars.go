package organisationPermission

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
	"organisation_id": 1,
	"spaces":          5,
	"media":           10,
	"posts":           10,
	"fact_check":      true,
}

var invalidData = map[string]interface{}{
	"organisationid": 1,
	"spes":           5,
}

var undecodableData = map[string]interface{}{
	"organisation_id": "1",
	"spes":            5,
}

var permissionList = []map[string]interface{}{
	{
		"organisation_id": 1,
		"spaces":          5,
		"media":           10,
		"posts":           10,
		"fact_check":      true,
	},
	{
		"organisation_id": 2,
		"spaces":          3,
		"media":           20,
		"posts":           20,
		"fact_check":      true,
	},
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "organisation_id", "spaces", "mediums", "posts", "fact_check"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "organisation_permissions"`)
var countQuery = regexp.QuoteMeta(`SELECT count(1) FROM "organisation_permissions"`)
var deleteQuery = regexp.QuoteMeta(`UPDATE "organisation_permissions" SET "deleted_at"=`)

var basePath = "/core/organisations/permissions"
var path = "/core/organisations/permissions/{permission_id}"
var mypath = "/core/organisations/permissions/my"

func SelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["organisation_id"], Data["spaces"], Data["media"], Data["posts"], Data["fact_check"]))
}
