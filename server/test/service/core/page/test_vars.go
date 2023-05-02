package page

import (
	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}
var TestTitle = "Test Title"
var TestSubTitle = "Test Subtitle"
var TestSlug = "test-title"
var TestDescription = postgres.Jsonb{
	RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
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
var TestStatus = "draft"
var TestIsPage = true
var TestExcerpt = "test excerpt"
var TestIsFeatured = false
var TestIsSticky = false
var TestIsHighlighted = false
var TestFormatID uint = 1
var TestSpaceID uint = 1
var TestMeta = postgres.Jsonb{}
var TestHeaderCode = "header code"
var TestFooterCode = "footer code"
var TestMetaFields = postgres.Jsonb{}
var TestMigrationID uint = 0
var TestCategoryIDs []uint = []uint{}
var TestTagIDs []uint = []uint{}
var TestClaimIDs []uint = []uint{}
var TestAuthorIDs []uint = []uint{}
var TestMigrationHtml = "<p>migration</p>"
var TestFeaturedMediumID uint = 1

var basePath = "/core/pages"
var path = "/core/pages/{page_id}"
var Data = map[string]interface{}{
	"title":          TestTitle,
	"subtitle":       TestSubTitle,
	"slug":           TestSlug,
	"status":         "draft",
	"is_page":        true,
	"excerpt":        TestExcerpt,
	"description":    TestDescriptionFromRequest,
	"is_featured":    TestIsFeatured,
	"is_sticky":      TestIsSticky,
	"is_highlighted": TestIsHighlighted,
	"category_ids":   []uint{},
	"tag_ids":        []uint{},
	"author_ids":     []uint{},
	"space_id":       TestSpaceID,
}
var resData = map[string]interface{}{
	"title":            TestTitle,
	"subtitle":         TestSubTitle,
	"slug":             TestSlug,
	"status":           "draft",
	"is_page":          true,
	"excerpt":          TestExcerpt,
	"description":      TestDescriptionJson,
	"description_html": TestDescriptionHtml,
	"is_featured":      TestIsFeatured,
	"is_sticky":        TestIsSticky,
	"is_highlighted":   TestIsHighlighted,
}

var invalidData = map[string]interface{}{
	"title": "a",
}
