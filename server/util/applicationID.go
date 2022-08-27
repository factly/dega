package util

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/factly/dega-server/util/timex"
	"github.com/spf13/viper"
)

func GetApplicationID(userID uint, appSlug string) (uint, error) {
	req, err := http.NewRequest(http.MethodGet, viper.GetString("kavach_url")+fmt.Sprintf("/util/application/%s", appSlug), nil)
	if err != nil {
		return 0, err
	}

	req.Header.Set("X-User", fmt.Sprintf("%d", userID))
	client := http.Client{Timeout: time.Minute * time.Duration(timex.HTTP_TIMEOUT)}
	response, err := client.Do(req)
	if err != nil {
		return 0, err
	}

	defer response.Body.Close()
	responseBody := map[string]interface{}{}
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		return 0, err
	}

	if response.StatusCode != 200 {
		return 0, errors.New("internal server error on kavach while getting application id from space id")
	}
	appID := int(responseBody["application_id"].(float64))
	return uint(appID), nil
}
