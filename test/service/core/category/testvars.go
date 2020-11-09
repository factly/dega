package category

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data map[string]interface{} = map[string]interface{}{
	"name":        "Test category",
	"slug":        "test-category",
	"description": "Test Description",
	"parent_id":   0,
	"medium_id":   1,
	"is_featured": true,
}
var resData map[string]interface{} = map[string]interface{}{
	"name":        "Test category",
	"slug":        "test-category",
	"description": "Test Description",
	"is_featured": true,
}

var invalidData map[string]interface{} = map[string]interface{}{
	"nae": "Tecateg",
	"slg": "test-category",
}

var categorylist []map[string]interface{} = []map[string]interface{}{
	{
		"name":        "Test category 1",
		"slug":        "test-category-1",
		"description": "Test Description 1",
		"parent_id":   0,
		"medium_id":   1,
		"is_featured": true,
	},
	{
		"name":        "Test category 2",
		"slug":        "test-category-2",
		"description": "Test Description 2",
		"parent_id":   0,
		"medium_id":   1,
		"is_featured": true,
	},
}

var Columns []string = []string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "description", "parent_id", "medium_id", "is_featured", "space_id"}

var selectQuery string = regexp.QuoteMeta(`SELECT * FROM "categories"`)
var countQuery string = regexp.QuoteMeta(`SELECT count(1) FROM "categories"`)
var deleteQuery string = regexp.QuoteMeta(`UPDATE "categories" SET "deleted_at"=`)

const path string = "/core/categories/{category_id}"
const basePath string = "/core/categories"

func selectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["description"], Data["parent_id"], Data["medium_id"], Data["is_featured"], 1))
}

func SelectWithOutSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["description"], Data["parent_id"], Data["medium_id"], Data["is_featured"], 1))
}

func slugCheckMock(mock sqlmock.Sqlmock, category map[string]interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "categories"`)).
		WithArgs(fmt.Sprint(category["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows(Columns))
}

func sameNameCount(mock sqlmock.Sqlmock, count int, name interface{}) {
	mock.ExpectQuery(countQuery).
		WithArgs(1, strings.ToLower(name.(string))).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func insertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	medium.SelectWithSpace(mock)
	mock.ExpectQuery(`INSERT INTO "categories"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["description"], Data["is_featured"], 1, Data["medium_id"]).
		WillReturnRows(sqlmock.
			NewRows([]string{"parent_id", "medium_id", "id"}).
			AddRow(1, 1, 1))
}

func insertWithMediumError(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "type", "title", "description", "caption", "alt_text", "file_size", "url", "dimensions", "space_id"}))

	mock.ExpectRollback()
}

func updateMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	medium.SelectWithSpace(mock)
	mock.ExpectExec(`UPDATE \"categories\"`).
		WithArgs(nil, test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	selectWithSpace(mock)

	medium.SelectWithSpace(mock)
	mock.ExpectExec(`UPDATE \"categories\"`).
		WithArgs(Data["is_featured"], 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	medium.SelectWithSpace(mock)
	mock.ExpectExec(`UPDATE \"categories\"`).
		WithArgs(test.AnyTime{}, Data["name"], Data["slug"], Data["description"], Data["medium_id"], 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	selectWithSpace(mock)
	medium.SelectWithOutSpace(mock)
}

func categoryPostAssociation(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "posts" JOIN "post_categories"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func deleteMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectExec(`UPDATE \"categories\"`).
		WithArgs(nil, 1, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectExec(deleteQuery).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
}
