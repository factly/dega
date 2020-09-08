package meili

import (
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
)

// SearchWithoutQuery calls meili without q
func SearchWithoutQuery(filters string, kind string) (map[string]interface{}, error) {

	body := map[string]interface{}{
		"filters":      filters,
		"facetFilters": []string{"kind:" + kind},
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

// GetIDArray gets array of IDs for search results
func GetIDArray(result map[string]interface{}) []uint {
	arr := make([]uint, 0)
	hits := result["hits"].([]interface{})

	if len(hits) == 0 {
		return arr
	}

	for _, hit := range hits {
		hitMap := hit.(map[string]interface{})
		id := hitMap["id"].(float64)
		arr = append(arr, uint(id))
	}

	return arr
}
