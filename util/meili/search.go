package meili

import (
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
)

// SearchWithoutQuery calls meili without q
func SearchWithoutQuery(filters string) (map[string]interface{}, error) {

	body := map[string]interface{}{
		"filters":      filters,
		"facetFilters": []string{"kind:post"},
	}

	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&body)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", config.MeiliURL+"/indexes/dega/search", buf)
	req.Header.Add("X-Meili-API-Key", config.MeiliKey)
	req.Header.Add("Content-Type", "application/json")

	if err != nil {
		return nil, err
	}

	client := &http.Client{}
	res, err := client.Do(req)

	if err != nil {
		return nil, err
	}

	var result map[string]interface{}

	err = json.NewDecoder(res.Body).Decode(&result)
	if err != nil {
		return nil, err
	}

	return result, nil
}
