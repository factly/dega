package episode

import (
	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}
var TestTitle = "Test Episode"
var TestSlug = "test-episode"
var TestSeason = 1
var TestEpisode = 1
var TestAudioURL = "testaudio.com"
var TestSpaceID uint = 1
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
	"season":      TestSeason,
	"episode":     TestEpisode,
	"audio_url":   TestAudioURL,
}

var invalidData = map[string]interface{}{
	"tit": "T",
}

var resData = map[string]interface{}{
	"title":            TestTitle,
	"slug":             TestSlug,
	"description":      TestDescriptionJson,
	"description_html": TestDescriptionHtml,
	"season":           TestSeason,
	"episode":          TestEpisode,
	"audio_url":        TestAudioURL,
}

var basePath = "/podcast/episodes"
var path = "/podcast/episodes/{episode_id}"
