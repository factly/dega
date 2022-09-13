package util

import (
	"encoding/json"

	"github.com/jinzhu/gorm/dialects/postgres"
)

type Description struct {
	HTML string
	JSON postgres.Jsonb
}

func GetDescriptionHTML(jsonData postgres.Jsonb) (string, error) {
	var description Description
	err := json.Unmarshal(jsonData.RawMessage, &description)
	if err != nil {
		return "", err
	}
	return description.HTML, nil
}

func GetJSONDescription(jsonData postgres.Jsonb) (postgres.Jsonb, error) {
	var description Description
	err := json.Unmarshal(jsonData.RawMessage, &description)
	if err != nil {
		return postgres.Jsonb{}, err
	}
	return description.JSON, nil
}
