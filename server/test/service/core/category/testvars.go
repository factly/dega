package category

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/config"
	model "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/test"
	testModel "github.com/factly/dega-server/test/models"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var TestName = "Test category"
var TestSlug = "test-category"
var TestParentID uint = 0
var TestMediumId uint = 1
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
var TestMedium = testModel.Medium{
	Base: config.Base{
		ID:          1,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		UpdatedByID: 1,
		CreatedByID: 1,
	},
	Name:        "Image",
	Slug:        "image",
	Type:        "jpg",
	Title:       "Sample image",
	Description: "desc",
	Caption:     "sample",
	AltText:     "sample",
	FileSize:    100,
	URL: postgres.Jsonb{
		RawMessage: []byte(`{"raw":"http://testimage.com/test.jpg","proxy":"http://imageproxy/test.jpg"}`),
	},
	Dimensions: "testdims",
	MetaFields: postgres.Jsonb{
		RawMessage: []byte(`{"type":"meta field"}`),
	},
}
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

// var descriptionHTML =
var newData = &testModel.Category{
	Name:             TestName,
	Slug:             TestSlug,
	BackgroundColour: TestBackgroundColour,
	FooterCode:       TestFooterCode,
	HeaderCode:       TestHeaderCode,
	MetaFields:       TestMetaFields,
	Meta:             TestMeta,
	Description:      TestDescriptionFromRequest,
	MediumID:         TestMediumId,
	// ParentID: ,
}

var newResData = model.Category{
	Base: config.Base{
		ID:          1,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		UpdatedByID: 1,
		CreatedByID: 1,
	},
	SpaceID:          1,
	Name:             TestName,
	Slug:             TestSlug,
	BackgroundColour: TestBackgroundColour,
	FooterCode:       TestFooterCode,
	HeaderCode:       TestHeaderCode,
	MetaFields:       TestMetaFields,
	Meta:             TestMeta,
	Description:      TestDescriptionJson,
	DescriptionHTML:  TestDescriptionHtml,
	MediumID:         &TestMediumId,
	Medium:           (*model.Medium)(&TestMedium),
	ParentID:         nil,
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
	// "background_color": postgres.Jsonb{
	// 	RawMessage: []byte(`{
	// 		"hsl": {
	// 			"h": 0,
	// 			"s": 0.9131432944327529,
	// 			"l": 0.49478782000000004,
	// 			"a": 1
	// 		},
	// 		"hex": "#f10b0b",
	// 		"rgb": {
	// 			"r": 241,
	// 			"g": 11,
	// 			"b": 11,
	// 			"a": 1
	// 		},
	// 		"hsv": {
	// 			"h": 0,
	// 			"s": 0.9545999999999999,
	// 			"v": 0.9466,
	// 			"a": 1
	// 		},
	// 		"oldHue": 0,
	// 		"source": "hsv"
	// 	}`),
	// },
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

var categorylist []map[string]interface{} = []map[string]interface{}{
	{
		"name": "Test category 1",
		"slug": "test-category-1",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description 1"}}],"version":"2.19.0"}`),
		},
		"html_description": "<p>Test Description 1</p>",
		"parent_id":        0,
		"medium_id":        1,
		"meta_fields": postgres.Jsonb{
			RawMessage: []byte(`{"type":"description"}`),
		},
		"is_featured": true,
	},
	{
		"name": "Test category 2",
		"slug": "test-category-2",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description 2"}}],"version":"2.19.0"}`),
		},
		"html_description": "<p>Test Description 2</p>",
		"parent_id":        0,
		"medium_id":        1,
		"meta_fields": postgres.Jsonb{
			RawMessage: []byte(`{"type":"description"}`),
		},
		"is_featured": true,
	},
}

var Columns []string = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "description", "description_html", "background_colour", "parent_id", "meta_fields", "medium_id", "is_featured", "space_id", "meta", "header_code", "footer_code"}

var selectQuery string = regexp.QuoteMeta(`SELECT * FROM "categories"`)
var countQuery string = regexp.QuoteMeta(`SELECT count(*) FROM "categories"`)
var deleteQuery string = regexp.QuoteMeta(`UPDATE "categories" SET "deleted_at"=`)
var insertQuery string = regexp.QuoteMeta(`INSERT INTO "categories"`)

const path string = "/core/categories/{category_id}"
const basePath string = "/core/categories"

func selectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
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

// var Columns []string = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "description", "description_html", "background_colour", "parent_id", "meta_fields", "medium_id", "is_featured", "space_id", "meta", "header_code", "footer_code"}

func insertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	medium.SelectWithSpace(mock)
	mock.ExpectQuery(insertQuery).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, newData.Name, newData.Slug, newData.BackgroundColour, TestDescriptionJson, TestDescriptionHtml, newData.IsFeatured, 1, newData.MetaFields, newData.Meta, newData.HeaderCode, newData.FooterCode, newData.MediumID).
		// WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["name"], Data["slug"], Data["background_colour"], Data["description"], Data["description_html"], Data["is_featured"], 1, Data["meta_fields"], Data["meta"], Data["header_code"], Data["footer_code"], Data["medium_id"]).
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

// func selectMediumMock(mock sqlmock.Sqlmock) {

// }

func updateMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	medium.SelectWithSpace(mock)
	mock.ExpectExec(`UPDATE \"categories\"`).
		WithArgs(nil, test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	medium.SelectWithSpace(mock)
	mock.ExpectExec(`UPDATE \"categories\"`).
		WithArgs(test.AnyTime{}, Data["is_featured"], 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	medium.SelectWithSpace(mock)
	mock.ExpectExec(`UPDATE \"categories\"`).
		WithArgs(test.AnyTime{}, 1, Data["name"], Data["slug"], Data["description"], Data["html_description"], Data["medium_id"], Data["meta_fields"], 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	selectWithSpace(mock)
	medium.SelectWithOutSpace(mock, *newData)
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
