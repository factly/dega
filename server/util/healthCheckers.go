package util

import (
	"errors"
	"net/http"

	httpx "github.com/factly/dega-server/util/http"
	"github.com/spf13/viper"
)

// KetoChecker checks if keto is ready
func KetoChecker() error {
	_, err := KetoGetRequest("/health/ready")
	return err
}

// KratosChecker checks if Kratos is ready
func KratosChecker() error {
	return GetRequest(viper.GetString("kratos_public_url") + "/health/ready")
}

// KavachChecker checks if Kavach is ready
func KavachChecker() error {
	return GetRequest(viper.GetString("kavach_url") + "/health/ready")
}

// MeiliChecker checks if Meilisearch is ready
func MeiliChecker() error {
	return GetRequest(viper.GetString("meili_url") + "/health")
}

// GetRequest returns error if error in status code
func GetRequest(url string) error {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	client := httpx.CustomHttpClient()
	res, err := client.Do(req)
	if err != nil {
		return err
	}

	if res.StatusCode >= 500 {
		return errors.New("cannot connect")
	}
	return nil
}
