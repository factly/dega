package util

import (
	"encoding/json"
	"html/template"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// Template template object
var Template *template.Template

// SetupTemplates setups the templates
func SetupTemplates() {
	Template = template.Must(template.New("").Funcs(template.FuncMap{
		"unmar": unmarshal,
	}).ParseGlob("web/templates/*"))
}

func unmarshal(data postgres.Jsonb) map[string]interface{} {
	dataMap := make(map[string]interface{})
	_ = json.Unmarshal(data.RawMessage, &dataMap)
	return dataMap
}
