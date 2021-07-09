package util

import (
	"encoding/json"

	"github.com/factly/x/editorx"
	"github.com/jinzhu/gorm/dialects/postgres"
)

func HTMLDescription(jsonData postgres.Jsonb) (string, error) {
	editorjsBlocks := make(map[string]interface{})
	err := json.Unmarshal(jsonData.RawMessage, &editorjsBlocks)
	if err != nil {
		return "", err
	}
	description, err := editorx.EditorjsToHTML(editorjsBlocks)
	if err != nil {
		return "", err
	}
	return description, nil
}
