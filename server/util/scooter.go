package util

import (
	"encoding/json"
	"errors"
	"strings"

	"github.com/jinzhu/gorm/dialects/postgres"
)

type Description struct {
	HTML string
	JSON postgres.Jsonb
}

func hasKeyCaseInsensitive(data map[string]json.RawMessage, key string) bool {
	for k := range data {
		if strings.EqualFold(k, key) {
			return true
		}
	}
	return false
}

func GetDescriptionHTML(jsonData postgres.Jsonb) (string, error) {
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(jsonData.RawMessage, &raw); err != nil {
		return "", err
	}

	if !hasKeyCaseInsensitive(raw, "html") || !hasKeyCaseInsensitive(raw, "json") {
		return "", errors.New("missing required fields 'html' or 'json'")
	}

	var description Description
	if err := json.Unmarshal(jsonData.RawMessage, &description); err != nil {
		return "", err
	}

	return description.HTML, nil
}

func GetJSONDescription(jsonData postgres.Jsonb) (postgres.Jsonb, error) {
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(jsonData.RawMessage, &raw); err != nil {
		return postgres.Jsonb{}, err
	}

	if !hasKeyCaseInsensitive(raw, "html") || !hasKeyCaseInsensitive(raw, "json") {
		return postgres.Jsonb{}, errors.New("missing required fields 'html' or 'json'")
	}

	var description Description
	if err := json.Unmarshal(jsonData.RawMessage, &description); err != nil {
		return postgres.Jsonb{}, err
	}

	return description.JSON, nil
}
