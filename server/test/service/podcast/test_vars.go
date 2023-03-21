package podcast

import "github.com/jinzhu/gorm/dialects/postgres"

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var TestTitle = "Test Podcast"
var TestSlug = "test-podcast"
var TestLanguage = "english"
var TestHeaderCode = "header test"
var TestFooterCode = "footer test"
var TestSpaceID uint = uint(1)
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
	"title":       TestTitle,
	"slug":        TestSlug,
	"description": TestDescriptionFromRequest,
	"language":    TestLanguage,
	"header_code": TestHeaderCode,
	"footer_code": TestFooterCode,
}

var resData = map[string]interface{}{
	"title":               TestTitle,
	"slug":                TestSlug,
	"description":         TestDescriptionJson,
	"description_html":    TestDescriptionHtml,
	"language":            "english",
	"primary_category_id": 1,
	"medium_id":           1,
}

var invalidData = map[string]interface{}{
	"titl": "a",
}

var basePath = "/podcast"
var path = "/podcast/{podcast_id}"
