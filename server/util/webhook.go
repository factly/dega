package util

import (
	"encoding/json"
	"net/http"

	"github.com/spf13/viper"

	"github.com/factly/x/loggerx"
)

type CheckEvent struct {
	Enabled bool `json:"event_enabled"`
}

func CheckWebhookEvent(event string, spaceID string, r *http.Request) bool {
	authCtx, err := GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		return false
	}
	hukzURL := viper.GetString("hukz_url") + "/webhooks/space/" + spaceID + "/check"
	req, err := http.NewRequest("GET", hukzURL, nil)
	req.Header.Set("X-User", authCtx.UserID)
	q := req.URL.Query()
	q.Add("event", event)
	req.URL.RawQuery = q.Encode()
	if err != nil {
		loggerx.Error(err)
		return false
	}
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		return false
	}
	result := &CheckEvent{}
	err = json.NewDecoder(resp.Body).Decode(result)
	if err != nil {
		loggerx.Error(err)
		return false
	}

	return result.Enabled
}
