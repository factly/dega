package claim

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var TestClaim = "Claim Test"
var TestSlug = "claim-test"
var TestClaimDate = time.Now()
var TestCheckedDate = time.Now()
var TestClaimSources = postgres.Jsonb{
	RawMessage: []byte(`{"type":"claim sources"}`),
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
var TestHeaderCode = "header test"
var TestFooterCode = "footer test"
var TestStartTime int = 100
var TestEndTime int = 200
var TestFact = "test fact"
var TestReviewSources = postgres.Jsonb{
	RawMessage: []byte(`{"type":"review sources"}`),
}
var TestSpaceID uint = 1
var TestClaimantID = 1
var TestRatingID = 1

var Data = map[string]interface{}{
	"claim":         TestClaim,
	"slug":          TestSlug,
	"claim_sources": TestClaimSources,
	"description":   TestDescriptionFromRequest,
	"fact":          TestFact,
	"review_sources": postgres.Jsonb{
		RawMessage: []byte(`{"type":"review sources"}`),
	},
	"space_id": TestSpaceID,
}
var resData = map[string]interface{}{
	"claim":            TestClaim,
	"slug":             TestSlug,
	"claim_sources":    TestClaimSources,
	"description":      TestDescriptionJson,
	"description_html": TestDescriptionHtml,
	"fact":             TestFact,
	"review_sources": postgres.Jsonb{
		RawMessage: []byte(`{"type":"review sources"}`),
	},
	"space_id": TestSpaceID,
}

var invalidData = map[string]interface{}{
	"clai": "a",
}

var basePath = "/fact-check/claims"
var path = "/fact-check/claims/{claim_id}"
