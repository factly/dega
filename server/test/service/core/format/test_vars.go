package format

import "github.com/jinzhu/gorm/dialects/postgres"

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var TestName = "Test Name"
var TestSlug = "test-name"
var TestDescription = "Test Description"
var TestHeaderCode = "Test Header Code"
var TestFooterCode = "Test Footer Code"
var TestMetaFields = postgres.Jsonb{
	RawMessage: []byte(`{"type":"meta fields"}`),
}

var TestSpaceID uint = 1

var invalidData = map[string]interface{}{
	"name": "a",
}

var Data = map[string]interface{}{
	"name":        TestName,
	"slug":        TestSlug,
	"description": TestDescription,
	"meta_fields": TestMetaFields,
	"space_id":    TestSpaceID,
	"header_code": TestHeaderCode,
	"footer_code": TestFooterCode,
}

var resData = map[string]interface{}{
	"name":        TestName,
	"slug":        TestSlug,
	"description": TestDescription,
	"meta_fields": TestMetaFields,
	"space_id":    TestSpaceID,
}

var basePath = "/core/formats"
var defaultsPath = "/core/formats/default"
var path = "/core/formats/{format_id}"
