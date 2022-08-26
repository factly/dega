package util

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/factly/dega-server/util/timex"
	"github.com/factly/x/middlewarex"
	"github.com/spf13/viper"
)

// KetoAllowed is request object to check permissions of user
type KetoAllowed struct {
	Subject     string `json:"subject"`
	Action      string `json:"action"`
	Resource    string `json:"resource"`
	SubjectType string `json:"subject_type"`
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

			result := KetoAllowed{}

			result.Action = action
			result.Resource = entity
			result.Subject = fmt.Sprint(uID)
			result.SubjectType = "id"
			resStatus, err := IsAllowed(result, uint(oID), uint(sID), uint(uID))
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

func CheckAdmin(orgID, uID uint) (bool, error) {
	requestBody := map[string]interface{}{
		"namespace":  "organisations",
		"object":     fmt.Sprintf("org:%d", orgID),
		"relation":   "owner",
		"subject_id": fmt.Sprintf("%d", uID),
	}

	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&requestBody)
	if err != nil {
		return false, err
	}
	req, err := http.NewRequest("POST", viper.GetString("keto_url")+"/relation-tuples/check", buf)
	if err != nil {
		return false, err
	}

	client := http.Client{Timeout: time.Minute * time.Duration(timex.HTTP_TIMEOUT)}
	response, err := client.Do(req)
	if err != nil {
		return false, err
	}
	defer response.Body.Close()
	responseBody := make(map[string]interface{})
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		return false, err
	}

	if !(response.StatusCode == 200 || response.StatusCode == 403) {
		return false, errors.New("error in checking the authorization the relation tuple")
	}
	return responseBody["allowed"].(bool), nil
}

// IsAllowed checks if keto policy allows user to action on resource
func IsAllowed(result KetoAllowed, orgID, spaceID, userID uint) (int, error) {
	isAdmin, err := CheckAdmin(orgID, userID)
	if err != nil {
		return 0, err
	}
	if isAdmin {
		return http.StatusOK, nil
	}
	buf := new(bytes.Buffer)
	err = json.NewEncoder(buf).Encode(&result)
	if err != nil {
		return 0, err
	}

	req, err := http.NewRequest("POST", viper.GetString("kavach_url")+fmt.Sprintf("/organisations/%d/applications/%s/spaces/%d/policy/allowed", orgID, viper.GetString("dega_application_id"), spaceID), buf)
	if err != nil {
		return 0, err
	}
	req.Header.Set("X-User", fmt.Sprintf("%d", userID))
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{Timeout: time.Minute * time.Duration(timex.HTTP_TIMEOUT)}
	resp, err := client.Do(req)
	if err != nil {
		return 0, err
	}

	return resp.StatusCode, nil
}
