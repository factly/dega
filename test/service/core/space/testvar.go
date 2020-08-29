package space

import (
	"encoding/json"
	"fmt"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
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

func SelectQuery(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["logo_id"], Data["logo_mobile_id"], Data["fav_icon_id"], Data["mobile_icon_id"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], Data["organisation_id"]))
}

func slugCheckMock(mock sqlmock.Sqlmock, space map[string]interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "spaces"`)).
		WithArgs(fmt.Sprint(space["slug"], "%"), 0).
		WillReturnRows(sqlmock.NewRows(Columns))
}

func insertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectQuery(`INSERT INTO "spaces"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], Data["organisation_id"]).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT "logo_id", "logo_mobile_id", "fav_icon_id", "mobile_icon_id" FROM "spaces"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"logo_id", "logo_mobile_id", "fav_icon_id", "mobile_icon_id"}).
			AddRow(0, 0, 0, 0))

	mock.ExpectCommit()
}

func mediumNotFound(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "type", "title", "description", "caption", "alt_text", "file_size", "url", "dimensions", "space_id"}))
}
