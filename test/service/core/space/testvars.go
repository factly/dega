package space

import (
	"database/sql/driver"
	"encoding/json"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/jinzhu/gorm/dialects/postgres"
)

func nilJsonb() postgres.Jsonb {
	ba, _ := json.Marshal(nil)
	return postgres.Jsonb{
		RawMessage: ba,
	}
}

var Data map[string]interface{} = map[string]interface{}{
	"name":               "Test Space",
	"slug":               "test-space",
	"site_title":         "Test site title",
	"tag_line":           "Test tagline",
	"description":        "Test Description",
	"site_address":       "testaddress.com",
	"logo_id":            1,
	"logo_mobile_id":     1,
	"fav_icon_id":        1,
	"mobile_icon_id":     1,
	"verification_codes": nilJsonb(),
	"social_media_urls":  nilJsonb(),
	"contact_info":       nilJsonb(),
	"organisation_id":    1,
}

var resData map[string]interface{} = map[string]interface{}{
	"name":               "Test Space",
	"slug":               "test-space",
	"site_title":         "Test site title",
	"tag_line":           "Test tagline",
	"description":        "Test Description",
	"site_address":       "testaddress.com",
	"verification_codes": nilJsonb(),
	"social_media_urls":  nilJsonb(),
	"contact_info":       nilJsonb(),
	"organisation_id":    1,
}

var invalidData map[string]interface{} = map[string]interface{}{
	"nam":             "Te",
	"slug":            "test-space",
	"organisation_id": 0,
}

var Columns = []string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "site_title", "tag_line", "description", "site_address", "logo_id", "logo_mobile_id", "fav_icon_id", "mobile_icon_id", "verification_codes", "social_media_urls", "contact_info", "organisation_id"}

var selectQuery string = regexp.QuoteMeta(`SELECT * FROM "spaces"`)
var deleteQuery string = regexp.QuoteMeta(`UPDATE "spaces" SET "deleted_at"=`)

const path string = "/core/spaces/{space_id}"
const basePath string = "/core/spaces"

func SelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["logo_id"], Data["logo_mobile_id"], Data["fav_icon_id"], Data["mobile_icon_id"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], Data["organisation_id"]))
}

func insertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectQuery(`INSERT INTO "spaces"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], Data["organisation_id"]).
		WillReturnRows(sqlmock.
			NewRows([]string{"fav_icon_id", "mobile_icon_id", "logo_id", "logo_mobile_id", "id"}).
			AddRow(0, 0, 0, 0, 1))
}

func mediumNotFound(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "type", "title", "description", "caption", "alt_text", "file_size", "url", "dimensions", "space_id"}))
}

func updateMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "site_title", "tag_line", "description", "site_address", 1, 1, 1, 1, nilJsonb(), nilJsonb(), nilJsonb(), 1))

	mock.ExpectBegin()
	medium.SelectWithSpace(mock)
	medium.SelectWithSpace(mock)
	medium.SelectWithSpace(mock)
	medium.SelectWithSpace(mock)
	mock.ExpectExec(`UPDATE \"spaces\"`).
		WithArgs(test.AnyTime{}, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["logo_id"], Data["logo_mobile_id"], Data["fav_icon_id"], Data["mobile_icon_id"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	SelectQuery(mock, 1, 1)
	medium.SelectWithOutSpace(mock)
	medium.SelectWithOutSpace(mock)
	medium.SelectWithOutSpace(mock)
	medium.SelectWithOutSpace(mock)
}

func oneMediaIDZeroMock(mock sqlmock.Sqlmock, updateargs ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "site_title", "tag_line", "description", "site_address", 1, 1, 1, 1, nilJsonb(), nilJsonb(), nilJsonb(), 1))

	mock.ExpectBegin()
	medium.SelectWithSpace(mock)
	medium.SelectWithSpace(mock)
	medium.SelectWithSpace(mock)

	mock.ExpectExec(`UPDATE \"spaces\"`).
		WithArgs(nil, test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "site_title", "tag_line", "description", "site_address", nil, 1, 1, 1, nilJsonb(), nilJsonb(), nilJsonb(), 1))

	medium.SelectWithSpace(mock)
	medium.SelectWithSpace(mock)
	medium.SelectWithSpace(mock)

	mock.ExpectExec(`UPDATE \"spaces\"`).
		WithArgs(updateargs...).
		WillReturnResult(sqlmock.NewResult(1, 1))
	SelectQuery(mock, 1, 1)
	medium.SelectWithOutSpace(mock)
	medium.SelectWithOutSpace(mock)
	medium.SelectWithOutSpace(mock)
	medium.SelectWithOutSpace(mock)
	mock.ExpectCommit()
}
