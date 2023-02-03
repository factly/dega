package category

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	testModel "github.com/factly/dega-server/test/models"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

// Test Variables
var TestName = "Test category"
var TestSlug = "test-category"
var TestParentID uint = 0
var TestMediumId uint = 1
var TestSpaceId uint = 1
var TestIsFeatured = false
var TestMetaFields = postgres.Jsonb{
	RawMessage: []byte(`{"type":"description"}`),
}
var TestHeaderCode = "header test"
var TestFooterCode = "footer test"
var TestBackgroundColour = postgres.Jsonb{
	RawMessage: []byte(`{"colour":"#ffff"}`),
}
var TestMeta = postgres.Jsonb{
	RawMessage: []byte(`{"type":"description"}`),
}
var TestDescriptionHtml = "<h2>This is movies Heading</h2><p>THis is test descruoption</p>"
var TestDescriptionJson = postgres.Jsonb{RawMessage: []byte(`{"type":"doc","content":[{"type":"heading","attrs":{"textAlign":"left","level":2},"content":[{"type":"text","text":"This is movies Heading"}]},{"type":"paragraph","attrs":{"textAlign":"left"},"content":[{"type":"text","text":"THis is test descruoption"}]}]}`)}
var TestDescriptionFromRequest = postgres.Jsonb{
	RawMessage: []byte(`{
		"html": "<h2>This is movies Heading</h2><p>THis is test descruoption</p>",
		"json": {
			"type": "doc",
			"content": [
				{
					"type": "heading",
					"attrs": {
						"textAlign": "left",
						"level": 2
					},
					"content": [
						{
							"type": "text",
							"text": "This is movies Heading"
						}
					]
				},
				{
					"type": "paragraph",
					"attrs": {
						"textAlign": "left"
					},
					"content": [
						{
							"type": "text",
							"text": "THis is test descruoption"
						}
					]
				}
			]
		}
	}`),
}

// updated Test Data
var newData = &testModel.Category{
	Name:             TestName,
	Slug:             TestSlug,
	BackgroundColour: TestBackgroundColour,
	FooterCode:       TestFooterCode,
	HeaderCode:       TestHeaderCode,
	MetaFields:       TestMetaFields,
	Meta:             TestMeta,
	Description:      TestDescriptionFromRequest,
	MediumID:         &TestMediumId,
	// ParentID:         &TestParentID,
}

// updated Test Response Data
var newResData = map[string]interface{}{
	"space_id":          TestSpaceId,
	"name":              TestName,
	"slug":              TestSlug,
	"background_colour": TestBackgroundColour,
	"footer_code":       TestFooterCode,
	"header_code":       TestHeaderCode,
	"meta":              TestMeta,
	"meta_fields":       TestMetaFields,
	"description":       TestDescriptionJson,
	"description_html":  TestDescriptionHtml,
	"medium_id":         TestMediumId,
	"parent_id":         nil,
	"is_featured":       TestIsFeatured,
}

var Data map[string]interface{} = map[string]interface{}{
	"name": "Test category",
	"slug": "test-category",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"description_html": "<p>Test Description</p>",
	"parent_id":        0,
	"medium_id":        1,
	"is_featured":      true,
	"meta_fields": postgres.Jsonb{
		RawMessage: []byte(`{"type":"description"}`),
	},
	"header_code":       "header test",
	"footer_code":       "footer test",
	"background_colour": nil,
	"meta": postgres.Jsonb{
		RawMessage: []byte(`{"type":"description"}`),
	},
}

var resData map[string]interface{} = map[string]interface{}{
	"name": "Test category",
	"slug": "test-category",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description": "<p>Test Description</p>",
	"meta_fields": postgres.Jsonb{
		RawMessage: []byte(`{"type":"description"}`),
	},
	"is_featured":       true,
	"background_colour": nil,
	"meta": postgres.Jsonb{
		RawMessage: []byte(`{"type":"description"}`),
	},
	"header_code": "header test",
	"footer_code": "footer test",
}

var invalidData map[string]interface{} = map[string]interface{}{
	"nae": "Tecateg",
	"slg": "test-category",
}

var categorylist []testModel.Category = []testModel.Category{*newData, {
	Name:             "Test Name 2",
	Slug:             "testname2",
	BackgroundColour: TestBackgroundColour,
	FooterCode:       TestFooterCode,
	HeaderCode:       TestHeaderCode,
	MetaFields:       TestMetaFields,
	Meta:             TestMeta,
	Description:      TestDescriptionFromRequest,
	MediumID:         &TestMediumId,
}}

var Columns []string = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "description", "description_html", "background_colour", "parent_id", "meta_fields", "medium_id", "is_featured", "space_id", "meta", "header_code", "footer_code"}

var selectQuery string = regexp.QuoteMeta(`SELECT * FROM "categories"`)
var countQuery string = regexp.QuoteMeta(`SELECT count(*) FROM "categories"`)
var deleteQuery string = regexp.QuoteMeta(`UPDATE "categories" SET "deleted_at"=`)
var insertQuery string = regexp.QuoteMeta(`INSERT INTO "categories"`)

const path string = "/core/categories/{category_id}"
const basePath string = "/core/categories"

func selectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, newData.Name, newData.Slug, TestDescriptionJson, TestDescriptionHtml, newData.BackgroundColour, newData.ParentID, newData.MetaFields, newData.MediumID, newData.IsFeatured, 1, newData.Meta, newData.HeaderCode, newData.FooterCode))
}

func SelectWithOutSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, newData.Name, newData.Slug, TestDescriptionJson, TestDescriptionHtml, newData.BackgroundColour, newData.ParentID, newData.MetaFields, newData.MediumID, newData.IsFeatured, 1, newData.Meta, newData.HeaderCode, newData.FooterCode))
}

func slugCheckMock(mock sqlmock.Sqlmock, category *testModel.Category) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "categories"`)).
		WithArgs(fmt.Sprint(category.Slug, "%"), 1).
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
	mock.ExpectQuery(insertQuery).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, newData.Name, newData.Slug, newData.BackgroundColour, TestDescriptionJson, TestDescriptionHtml, newData.IsFeatured, 1, newData.MetaFields, newData.Meta, newData.HeaderCode, newData.FooterCode, newData.MediumID).
		WillReturnRows(sqlmock.
			NewRows([]string{"parent_id", "medium_id", "id"}).
			AddRow(1, 1, 1))
}

func insertWithMediumError(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "type", "title", "description", "html_description", "caption", "alt_text", "file_size", "url", "dimensions", "space_id"}))

	mock.ExpectRollback()
}

func updateMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	// medium.SelectWithSpace(mock)
	// mock.ExpectExec(`UPDATE \"categories\"`).
	// 	WithArgs(nil, test.AnyTime{}, 1).
	// 	WillReturnResult(sqlmock.NewResult(1, 1))

	// medium.SelectWithSpace(mock)
	// mock.ExpectExec(`UPDATE \"categories\"`).
	// 	WithArgs(test.AnyTime{}, newData.IsFeatured, 1).
	// 	WillReturnResult(sqlmock.NewResult(1, 1))

	medium.SelectWithSpace(mock)
	mock.ExpectExec(`UPDATE \"categories\"`).
		WithArgs(newData.BackgroundColour, test.AnyTime{}, TestDescriptionJson, TestDescriptionHtml, newData.FooterCode, newData.HeaderCode,
			newData.IsFeatured, newData.MediumID, newData.Meta, newData.MetaFields, newData.Name, nil, newData.Slug, test.AnyTime{}, 1, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	// selectWithSpace(mock)
	mock.ExpectQuery(selectQuery).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, newData.Name, newData.Slug, TestDescriptionJson, TestDescriptionHtml, newData.BackgroundColour, newData.ParentID, newData.MetaFields, newData.MediumID, newData.IsFeatured, 1, newData.Meta, newData.HeaderCode, newData.FooterCode))

	medium.SelectWithOutSpace(mock)
}

func categoryPostAssociation(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "posts" JOIN "post_categories"`)).
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
