package claimant

import "github.com/jinzhu/gorm/dialects/postgres"

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}
var TestName = "Test Claimant"
var TestSlug = "test-claimant"
var TestIsFeatured = false
var TestTagline = "Test Tagline"
var TestMediumID uint = 1
var TestSpaceID uint = 1
var TestFooterCode = "Test Footer Code"
var TestHeaderCode = "Test Header Code"
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

var Data = map[string]interface{}{
	"name":        TestName,
	"slug":        TestSlug,
	"tag_line":    TestTagline,
	"medium_id":   TestMediumID,
	"space_id":    TestSpaceID,
	"footer_code": TestFooterCode,
	"header_code": TestHeaderCode,
	"description": TestDescriptionFromRequest,
	"is_featured": TestIsFeatured,
}

var resData = map[string]interface{}{
	"name":             TestName,
	"slug":             TestSlug,
	"description":      TestDescriptionJson,
	"description_html": TestDescriptionHtml,
	"tag_line":         TestTagline,
	"footer_code":      TestFooterCode,
	"header_code":      TestHeaderCode,
	"is_featured":      TestIsFeatured,
	"space_id":         TestSpaceID,
}

var invalidData = map[string]interface{}{
	"nam": "a",
}

var basePath = "/fact-check/claimants"
var path = "/fact-check/claimants/{claimant_id}"
