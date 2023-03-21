package medium

import (
	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

// test variables

var TestName = "Image"
var TestSlug = "image"
var TestType = "jpg"
var TestTitle = "Sample image"
var TestDescription = "desc"
var TestCaption = "caption"
var TestAltText = "alttext"
var TestFileSize int64 = 100
var TestUrl = postgres.Jsonb{
	RawMessage: []byte(`{"raw":"http://testimage.com/test.jpg"}`),
}
var TestDimensions = "testdims"
var TestMetaFields = postgres.Jsonb{
	RawMessage: []byte(`{"type":"meta field"}`),
}
var TestSpaceID uint = 1

var Data map[string]interface{} = map[string]interface{}{
	"name":        TestName,
	"slug":        TestSlug,
	"type":        TestType,
	"title":       TestTitle,
	"description": TestDescription,
	"caption":     TestCaption,
	"alt_text":    TestAltText,
	"file_size":   TestFileSize,
	"url":         TestUrl,
	"dimensions":  TestDimensions,
	"meta_fields": TestMetaFields,
	"space_id":    TestSpaceID,
}

var createArr = []map[string]interface{}{Data}

var invalidData = []map[string]interface{}{
	{
		"name": "A",
	},
}

var basePath = "/core/media"
var path = "/core/media/{medium_id}"
