package util

import "html/template"

// Template template object
var Template *template.Template

// SetupTemplates setups the templates
func SetupTemplates() {
	Template = template.Must(template.ParseGlob("web/templates/*"))
}
