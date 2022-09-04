package util

import (
	"net/http"

	httpx "github.com/factly/dega-server/util/http"
	"github.com/spf13/viper"
)

// KetoGetRequest does get request to keto with empty body
func KetoGetRequest(path string) (*http.Response, error) {
	req, err := http.NewRequest("GET", viper.GetString("keto_url")+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := httpx.CustomHttpClient()
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
