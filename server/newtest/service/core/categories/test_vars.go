package categories

import (
	testModel "github.com/factly/dega-server/newtest/models"
	"github.com/factly/dega-server/service/core/model"
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

var Data = &testModel.Category{
	Name:             TestName,
	Slug:             TestSlug,
	BackgroundColour: TestBackgroundColour,
	FooterCode:       TestFooterCode,
	HeaderCode:       TestHeaderCode,
	MetaFields:       TestMetaFields,
	Meta:             TestMeta,
	Description:      TestDescriptionFromRequest,
	MediumID:         &TestMediumId,
	ParentID:         &TestParentID,
}

var resData = map[string]interface{}{
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
	"medium_id":         &TestMediumId,
	"parent_id":         nil,
	"is_featured":       TestIsFeatured,
}

var mediumData = &testModel.Medium{
	Name:        "Image",
	Slug:        "image",
	Type:        "jpg",
	Title:       "Sample image",
	Description: "desc",
	Caption:     "sample",
	AltText:     "sample",
	FileSize:    100,
	SpaceID:     TestSpaceId,
	URL: postgres.Jsonb{
		RawMessage: []byte(`{"raw":"http://testimage.com/test.jpg"}`),
	},
	Dimensions: "testdims",
	MetaFields: postgres.Jsonb{
		RawMessage: []byte(`{"type":"meta field"}`),
	},
}

var invalidData = map[string]interface{}{
	"nae": "Tecateg",
	"slg": "test-category",
}

var categoryList []model.Category = []model.Category{{
	Name:             "List Test Name 1",
	Slug:             "list-test-name1",
	BackgroundColour: TestBackgroundColour,
	FooterCode:       TestFooterCode,
	HeaderCode:       TestHeaderCode,
	MetaFields:       TestMetaFields,
	Meta:             TestMeta,
	Description:      TestDescriptionJson,
	DescriptionHTML:  TestDescriptionHtml,
	SpaceID:          1,
	MediumID:         &TestMediumId}, {
	Name:             "List Test Name 2",
	Slug:             "list-test-name1",
	BackgroundColour: TestBackgroundColour,
	FooterCode:       TestFooterCode,
	HeaderCode:       TestHeaderCode,
	MetaFields:       TestMetaFields,
	Meta:             TestMeta,
	SpaceID:          1,
	Description:      TestDescriptionJson,
	DescriptionHTML:  TestDescriptionHtml,
	MediumID:         &TestMediumId},
}

var Columns []string = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "description", "description_html", "background_colour", "parent_id", "meta_fields", "medium_id", "is_featured", "space_id", "meta", "header_code", "footer_code"}

const path string = "/core/categories/{category_id}"
const basePath string = "/core/categories"
