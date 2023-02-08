package tag

import (
	testModel "github.com/factly/dega-server/newtest/models"
	"github.com/factly/dega-server/service/core/model"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

//Test Variables

var TestName = "Tag Test"
var TestSlug = "tag-test"
var TestSpaceId uint = 1
var IsFeatured = false
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
var TestDescriptionHtml = "<h2>This is movies Heading</h2><p>THis is test descruoption</p>"
var TestDescriptionJson = postgres.Jsonb{RawMessage: []byte(`{"type":"doc","content":[{"type":"heading","attrs":{"textAlign":"left","level":2},"content":[{"type":"text","text":"This is movies Heading"}]},{"type":"paragraph","attrs":{"textAlign":"left"},"content":[{"type":"text","text":"THis is test descruoption"}]}]}`)}
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
var TestMediumId uint = 1
var Data testModel.Tag = testModel.Tag{
	Name:             TestName,
	Slug:             TestSlug,
	Description:      TestDescriptionFromRequest,
	MetaFields:       TestMetaFields,
	Meta:             TestMeta,
	BackgroundColour: TestBackgroundColour,
	HeaderCode:       TestHeaderCode,
	FooterCode:       TestFooterCode,
	MediumID:         TestMediumId,
}

var resData = map[string]interface{}{
	"name":              TestName,
	"slug":              TestSlug,
	"description_html":  TestDescriptionHtml,
	"description":       TestDescriptionJson,
	"background_colour": TestBackgroundColour,
	"footer_code":       TestFooterCode,
	"header_code":       TestHeaderCode,
	"meta_fields":       TestMetaFields,
	"meta":              TestMeta,
	"medium_id":         TestMediumId,
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

var invalidData = `{"name":}`

const path string = "/core/tags/{tag_id}"
const basePath string = "/core/tags"

var tag_list []model.Tag = []model.Tag{
	{Name: "List Test 1", Slug: "list-test-1", SpaceID: 1, MediumID: &TestMediumId, Description: TestDescriptionJson, DescriptionHTML: TestDescriptionHtml, MetaFields: TestMetaFields, Meta: TestMeta, BackgroundColour: TestBackgroundColour, HeaderCode: TestHeaderCode, FooterCode: TestFooterCode},
	{Name: "List Test 2", Slug: "list-test-2", SpaceID: 1, MediumID: &TestMediumId, Description: TestDescriptionJson, DescriptionHTML: TestDescriptionHtml, MetaFields: TestMetaFields, Meta: TestMeta, BackgroundColour: TestBackgroundColour, HeaderCode: TestHeaderCode, FooterCode: TestFooterCode},
}
