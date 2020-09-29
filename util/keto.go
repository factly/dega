package util

import (
	"net/http"

	"github.com/factly/dega-server/config"
)

// KetoGetRequest does get request to keto with empty body
func KetoGetRequest(path string) (*http.Response, error) {
	req, err := http.NewRequest("GET", config.KetoURL+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
