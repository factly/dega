package menu

import "github.com/jinzhu/gorm/dialects/postgres"

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"name": "Elections",
	"slug": "elections",
	"menu": postgres.Jsonb{
		RawMessage: []byte(`{"item1":"description"}`),
	},
	"meta_fields": postgres.Jsonb{
		RawMessage: []byte(`{"type":"meta field"}`),
	},
}

var invalidData = map[string]interface{}{
	"name": "a",
}
var basePath = "/core/menus"
var path = "/core/menus/{menu_id}"

var TestName = "Menu Test"
var TestSlug = "menu-test"
var TestMenu = postgres.Jsonb{
	RawMessage: []byte(`{"item1":"description"}`),
}
var TestMetaFields = postgres.Jsonb{
	RawMessage: []byte(`{"type":"meta field"}`),
}
var TestSpaceID uint = 1
