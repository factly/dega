package post

import "github.com/jinzhu/gorm/dialects/postgres"

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
var TestIsPage = false
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

var resData = map[string]interface{}{
	"title":            TestTitle,
	"subtitle":         TestSubTitle,
	"slug":             TestSlug,
	"description":      TestDescriptionJson,
	"description_html": TestDescriptionHtml,
	"status":           TestStatus,
	"is_page":          TestIsPage,
	"excerpt":          TestExcerpt,
	"is_featured":      TestIsFeatured,
	"is_sticky":        TestIsSticky,
	"is_highlighted":   TestIsHighlighted,
	"space_id":         TestSpaceID,
	"meta":             TestMeta,
	"header_code":      TestHeaderCode,
	"footer_code":      TestFooterCode,
	"meta_fields":      TestMetaFields,
	"migration_id":     TestMigrationID,
	"categories":       TestCategoryIDs,
	"tags":             TestTagIDs,
	"claims":           TestClaimIDs,
}

var Data = map[string]interface{}{
	"title":          TestTitle,
	"subtitle":       TestSubTitle,
	"slug":           TestSlug,
	"description":    TestDescriptionFromRequest,
	"status":         TestStatus,
	"is_page":        TestIsPage,
	"excerpt":        TestExcerpt,
	"is_featured":    TestIsFeatured,
	"is_sticky":      TestIsSticky,
	"is_highlighted": TestIsHighlighted,
	"format_id":      TestFormatID,
	"space_id":       TestSpaceID,
	"meta":           TestMeta,
	"header_code":    TestHeaderCode,
	"footer_code":    TestFooterCode,
	"meta_fields":    TestMetaFields,
	"migration_id":   TestMigrationID,
	"category_ids":   TestCategoryIDs,
	"tag_ids":        TestTagIDs,
	"claim_ids":      TestClaimIDs,
	"author_ids":     TestAuthorIDs,
}

var invaidData = map[string]interface{}{
	"tite": "a",
}

var basePath = "/core/posts"
var path = "/core/posts/{post_id}"
