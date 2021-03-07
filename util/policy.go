package util

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/factly/x/middlewarex"
	"github.com/spf13/viper"
)

// KetoAllowed is request object to check permissions of user
type KetoAllowed struct {
	Subject  string `json:"subject"`
	Action   string `json:"action"`
	Resource string `json:"resource"`
}

// CheckKetoPolicy returns middleware that checks the permissions of user from keto server
func CheckKetoPolicy(entity, action string) func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()

			sID, err := middlewarex.GetSpace(ctx)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			uID, err := middlewarex.GetUser(ctx)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			oID, err := GetOrganisation(ctx)

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			commonString := fmt.Sprint(":org:", oID, ":app:dega:space:", sID, ":")

			kresource := fmt.Sprint("resources", commonString, entity)
			kaction := fmt.Sprint("actions", commonString, entity, ":", action)

			result := KetoAllowed{}

			result.Action = kaction
			result.Resource = kresource
			result.Subject = fmt.Sprint(uID)

			resStatus, err := IsAllowed(result)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			if resStatus != 200 {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			h.ServeHTTP(w, r)
		})
	}
}

// CheckSpaceKetoPermission checks keto policy for operations on space
func CheckSpaceKetoPermission(action string, oID, uID uint) error {
	commonString := fmt.Sprint(":org:", oID, ":app:dega:spaces")

	kresource := fmt.Sprint("resources", commonString)
	kaction := fmt.Sprint("actions", commonString, ":", action)

	result := KetoAllowed{}

	result.Action = kaction
	result.Resource = kresource
	result.Subject = fmt.Sprint(uID)

	resStatus, err := IsAllowed(result)
	if err != nil {
		return err
	}

	if resStatus != 200 {
		return errors.New("Permission not granted")
	}
	return nil
}

// IsAllowed checks if keto policy allows user to action on resource
func IsAllowed(result KetoAllowed) (int, error) {
	buf := new(bytes.Buffer)

	err := json.NewEncoder(buf).Encode(&result)
	if err != nil {
		return 0, err
	}

	req, err := http.NewRequest("POST", viper.GetString("keto_url")+"/engines/acp/ory/regex/allowed", buf)
	if err != nil {
		return 0, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return 0, err
	}

	return resp.StatusCode, nil
}
