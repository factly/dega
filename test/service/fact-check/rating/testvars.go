package rating

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"name": "True",
	"slug": "true",
	"background_colour": postgres.Jsonb{
		RawMessage: []byte(`"green"`),
	},
	"text_colour": postgres.Jsonb{
		RawMessage: []byte(`"green"`),
	},
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description": "<p>Test Description</p>",
	"numeric_value":    5,
	"medium_id":        uint(1),
}

var resData = map[string]interface{}{
	"name":              "True",
	"slug":              "true",
	"background_colour": "green",
	"text_colour":       "green",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description": "<p>Test Description</p>",
	"numeric_value":    5,
}

var defaultData = []map[string]interface{}{
	{
		"name": "True",
		"slug": "true",
		"colour": postgres.Jsonb{
			RawMessage: []byte(`"green"`),
		},
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"blocks":[{"type":"paragraph","data":{"text":"True"}}]}`),
		},
		"html_description": "<p>True</p>",
		"numeric_value":    5,
	},
	{
		"name": "Partly True",
		"colour": postgres.Jsonb{
			RawMessage: []byte(`"yellow"`),
		},
		"slug": "partly-true",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"blocks":[{"type":"paragraph","data":{"text":"Partly True"}}]}`),
		},
		"html_description": "<p>Partly True</p>",
		"numeric_value":    4,
	},
	{
		"name": "Unverified",
		"colour": postgres.Jsonb{
			RawMessage: []byte(`"dark yellow"`),
		},
		"slug": "unverified",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"blocks":[{"type":"paragraph","data":{"text":"Unverified"}}]}`),
		},
		"html_description": "<p>Unverified</p>",
		"numeric_value":    3,
	},
	{
		"name": "Misleading",
		"slug": "misleading",
		"colour": postgres.Jsonb{
			RawMessage: []byte(`"orange"`),
		},
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"blocks":[{"type":"paragraph","data":{"text":"Misleading"}}]}`),
		},
		"html_description": "<p>Misleading</p>",
		"numeric_value":    2,
	},
	{
		"name": "False",
		"slug": "false",
		"colour": postgres.Jsonb{
			RawMessage: []byte(`"red"`),
		},
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"blocks":[{"type":"paragraph","data":{"text":"False"}}]}`),
		},
		"html_description": "<p>False</p>",
		"numeric_value":    1,
	},
	{
		"name": "Not a Claim",
		"slug": "not-a-claim",
		"colour": postgres.Jsonb{
			RawMessage: []byte(`"grey"`),
		},
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"blocks":[{"type":"paragraph","data":{"text":"Not a Claim"}}]}`),
		},
		"html_description": "<p>Not a Claim</p>",
		"numeric_value":    0,
	},
}

var invalidData = map[string]interface{}{
	"name":          "a",
	"numeric_value": 0,
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "background_colour", "text_colour", "medium_id", "description", "html_description", "numeric_value", "space_id"}

var selectQuery = `SELECT (.+) FROM "ratings"`
var deleteQuery = regexp.QuoteMeta(`UPDATE "ratings" SET "deleted_at"=`)
var paginationQuery = `SELECT \* FROM "ratings" (.+) LIMIT 1 OFFSET 1`

var basePath = "/fact-check/ratings"
var defaultsPath = "/fact-check/ratings/default"
var path = "/fact-check/ratings/{rating_id}"

func slugCheckMock(mock sqlmock.Sqlmock, rating map[string]interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "ratings"`)).
		WithArgs(fmt.Sprint(rating["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

func ratingInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	medium.SelectWithSpace(mock)
	mock.ExpectQuery(`INSERT INTO "ratings"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["name"], Data["slug"], Data["background_colour"], Data["text_colour"], Data["description"], Data["html_description"], Data["numeric_value"], Data["medium_id"], 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
}

func ratingInsertError(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	medium.EmptyRowMock(mock)
	mock.ExpectRollback()
}

func ratingUpdateMock(mock sqlmock.Sqlmock, rating map[string]interface{}, err error) {
	mock.ExpectBegin()
	if err != nil {
		medium.EmptyRowMock(mock)
	} else {
		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE \"ratings\"`).
			WithArgs(test.AnyTime{}, 1, rating["name"], rating["slug"], rating["background_colour"], rating["text_colour"], rating["description"], rating["html_description"], rating["numeric_value"], rating["medium_id"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		SelectWithSpace(mock)
		medium.SelectWithOutSpace(mock)
	}

}

func SelectWithOutSpace(mock sqlmock.Sqlmock, rating map[string]interface{}) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, rating["name"], rating["slug"], rating["background_colour"], rating["text_colour"], rating["medium_id"], rating["description"], rating["html_description"], rating["numeric_value"], 1))

	// Preload medium
	medium.SelectWithOutSpace(mock)
}

func SelectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["name"], Data["slug"], Data["background_colour"], Data["text_colour"], Data["medium_id"], Data["description"], Data["html_description"], Data["numeric_value"], 1))
}

//check rating exits or not
func recordNotFoundMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 100).
		WillReturnRows(sqlmock.NewRows(columns))
}

func sameNameCount(mock sqlmock.Sqlmock, count int, name interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "ratings"`)).
		WithArgs(1, strings.ToLower(name.(string))).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

// check rating associated with any claim before deleting
func ratingClaimExpect(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "claims"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func ratingCountQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "ratings"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func EmptyRowMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}
