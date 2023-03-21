package rating

import "github.com/jinzhu/gorm/dialects/postgres"

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var TestName = "rating"
var TestSlug = "rating"
var TestBackgroundColour = postgres.Jsonb{
	RawMessage: []byte(`"green"`),
}
var TestTextColour = postgres.Jsonb{
	RawMessage: []byte(`"green"`),
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

var TestNumericValue = 5
var TestMediumID = uint(1)
var TestHeaderCode = "test-header-code"
var TestFooterCode = "test-footer-code"
var TestSpaceID = uint(1)

var Data = map[string]interface{}{
	"name":              TestName,
	"slug":              TestSlug,
	"background_colour": TestBackgroundColour,
	"text_colour":       TestTextColour,
	"description":       TestDescriptionFromRequest,
	"numeric_value":     TestNumericValue,
	"medium_id":         TestMediumID,
	"header_code":       TestHeaderCode,
	"footer_code":       TestFooterCode,
	"space_id":          TestSpaceID,
}

var resData = map[string]interface{}{
	"name":              TestName,
	"slug":              TestSlug,
	"background_colour": TestBackgroundColour,
	"text_colour":       TestTextColour,
	"description":       TestDescriptionJson,
	"description_html":  TestDescriptionHtml,
	"numeric_value":     TestNumericValue,
	"header_code":       TestHeaderCode,
	"footer_code":       TestFooterCode,
	"space_id":          TestSpaceID,
}

// {"total":7,"nodes":[{"id":140,"created_at":"2023-02-27T06:27:34.277713Z","updated_at":"2023-02-27T06:27:34.277713Z","deleted_at":null,"created_by_id":2,"updated_by_id":2,"name":"new rating","slug":"new-rating","background_colour":null,"text_colour":null,"description":{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"left"},"content":[{"type":"text","text":"this a descripiton"}]}]},"description_html":"\u003cp\u003ethis a descripiton\u003c/p\u003e","numeric_value":50,"medium_id":null,"medium":null,"meta_fields":null,"space_id":2,"meta":null,"header_code":"","footer_code":""},{"id":66,"created_at":"2022-06-09T03:20:27.092245Z","updated_at":"2022-06-09T03:20:27.092245Z","deleted_at":null,"created_by_id":79,"updated_by_id":79,"name":"Missing Context","slug":"missing-context","background_colour":null,"text_colour":null,"description":null,"numeric_value":6,"medium_id":null,"medium":null,"meta_fields":null,"space_id":2,"meta":null,"header_code":"","footer_code":""},{"id":45,"created_at":"2021-07-29T19:15:03.0047Z","updated_at":"2021-07-29T19:15:03.0047Z","deleted_at":null,"created_by_id":2,"updated_by_id":2,"name":"Misleading","slug":"misleading","background_colour":{"hsl":{"h":165.40540540540542,"s":0.15352697095435683,"l":0.5274509803921569,"a":1},"hex":"#749990","rgb":{"r":116,"g":153,"b":144,"a":1},"hsv":{"h":165.40540540540542,"s":0.2418300653594771,"v":0.6,"a":1},"oldHue":165.40540540540542,"source":"hex"},"text_colour":null,"description":null,"numeric_value":2,"medium_id":null,"medium":null,"meta_fields":null,"space_id":2,"meta":null,"header_code":"","footer_code":""},{"id":5,"created_at":"2020-11-24T18:44:43.759601Z","updated_at":"2020-11-24T18:44:43.759601Z","deleted_at":null,"created_by_id":2,"updated_by_id":0,"name":"False","slug":"false","background_colour":{"hsl":{"h":359.68911917098444,"s":0.8075313807531379,"l":0.5313725490196078,"a":1},"hex":"#e82728","rgb":{"r":232,"g":39,"b":40,"a":1},"hsv":{"h":359.68911917098444,"s":0.8318965517241379,"v":0.9098039215686274,"a":1},"oldHue":359.68911917098444,"source":"hex"},"text_colour":{"hsl":{"h":0,"s":0,"l":0.9568627450980393,"a":1},"hex":"#f4f4f4","rgb":{"r":244,"g":244,"b":244,"a":1},"hsv":{"h":0,"s":0,"v":0.9568627450980393,"a":1},"oldHue":0,"source":"hex"},"description":null,"numeric_value":1,"medium_id":null,"medium":null,"meta_fields":null,"space_id":2,"meta":null,"header_code":"","footer_code":""},{"id":3,"created_at":"2020-11-24T18:44:43.759601Z","updated_at":"2020-11-24T18:44:43.759601Z","deleted_at":null,"created_by_id":2,"updated_by_id":0,"name":"Unverfied","slug":"unverfied","background_colour":{"hsl":{"h":37.49999999999999,"s":0.8403361344537816,"l":0.5333333333333333,"a":1},"hex":"#eca124","rgb":{"r":236,"g":161,"b":36,"a":1},"hsv":{"h":37.49999999999999,"s":0.8474576271186441,"v":0.9254901960784314,"a":1},"oldHue":165.40540540540542,"source":"hex"},"text_colour":null,"description":null,"numeric_value":3,"medium_id":null,"medium":null,"meta_fields":null,"space_id":2,"meta":null,"header_code":"","footer_code":""},{"id":2,"created_at":"2020-11-24T18:44:43.759601Z","updated_at":"2020-11-24T18:44:43.759601Z","deleted_at":null,"created_by_id":2,"updated_by_id":0,"name":"Partly True","slug":"partly-true","background_colour":{"hsl":{"h":72.70072992700729,"s":0.545816733067729,"l":0.492156862745098,"a":1},"hex":"#a5c239","rgb":{"r":165,"g":194,"b":57,"a":1},"hsv":{"h":72.70072992700729,"s":0.7061855670103093,"v":0.7607843137254902,"a":1},"oldHue":72.70072992700729,"source":"hex"},"text_colour":null,"description":null,"numeric_value":4,"medium_id":null,"medium":null,"meta_fields":null,"space_id":2,"meta":null,"header_code":"","footer_code":""},{"id":1,"created_at":"2020-11-24T18:44:43.759601Z","updated_at":"2020-11-24T18:44:43.759601Z","deleted_at":null,"created_by_id":2,"updated_by_id":0,"name":"True","slug":"true","background_colour":{"hsl":{"h":145.7142857142857,"s":0.7777777777777778,"l":0.2823529411764706,"a":1},"hex":"#108040","rgb":{"r":16,"g":128,"b":64,"a":1},"hsv":{"h":145.7142857142857,"s":0.875,"v":0.5019607843137255,"a":1},"oldHue":145.7142857142857,"source":"hex"},"text_colour":{"hsl":{"h":180,"s":0,"l":0.9568627450980393,"a":1},"hex":"#f4f4f4","rgb":{"r":244,"g":244,"b":244,"a":1},"hsv":{"h":180,"s":0,"v":0.9568627450980393,"a":1},"oldHue":180,"source":"hex"},"description":null,"numeric_value":5,"medium_id":null,"medium":null,"meta_fields":null,"space_id":2,"meta":null,"header_code":"","footer_code":""}]}

var invalidData = map[string]interface{}{
	"name":          "a",
	"numeric_value": 0,
}

var basePath = "/fact-check/ratings"
var defaultsPath = "/fact-check/ratings/default"
var path = "/fact-check/ratings/{rating_id}"
