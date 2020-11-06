package config

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/spf13/viper"
)

type organisation struct {
	Base
	Title string `json:"title"`
}

type flowInitResponse struct {
	ID      string         `json:"id,omitempty"`
	Type    string         `json:"type,omitempty"`
	Methods passwordMethod `json:"methods,omitempty"`
}

type passwordMethod struct {
	Password map[string]interface{} `json:"password,omitempty"`
}

// CheckSuperOrganisation checks if super organisation is present in kavach or not
func CheckSuperOrganisation() bool {
	// check if the config file has organisation.id param
	if viper.IsSet("organisation_id") {
		orgID := viper.GetInt("organisation_id")
		if orgID == 0 {
			return false
		}

		// check if organisation is present in kavach
		req, err := http.NewRequest("GET", viper.GetString("kavach_url")+"/organisations/"+fmt.Sprint(orgID), nil)
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return false
		}

		if resp.StatusCode == http.StatusOK {
			return true
		}
	}
	return false
}

// UserConfigPresent checks if user config params is present in config file
func UserConfigPresent() bool {
	return viper.IsSet("user_email") && viper.IsSet("user_password") && viper.GetString("user_email") != "" && viper.GetString("user_password") != "" && viper.IsSet("organisation_title")
}

// CreateSuperOrganisation creates a super user and organisation in kavach
func CreateSuperOrganisation() error {
	if !CheckSuperOrganisation() && UserConfigPresent() {
		// create a user in kratos through api
		req, _ := http.NewRequest("GET", viper.GetString("kratos_public_url")+"/self-service/registration/api", nil)
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return err
		}

		var body flowInitResponse

		json.NewDecoder(resp.Body).Decode(&body)

		var actionURL string
		passwordMap := body.Methods.Password

		if config, found := passwordMap["config"]; found {
			configMap := config.(map[string]interface{})
			if action, found := configMap["action"]; found {
				actionURL = action.(string)
			}
		}

		userCredsBody := map[string]interface{}{
			"traits.email": viper.GetString("user_email"),
			"password":     viper.GetString("user_password"),
		}

		buf := new(bytes.Buffer)
		err = json.NewEncoder(buf).Encode(&userCredsBody)
		if err != nil {
			return err
		}

		actionpathIdx := strings.Index(actionURL, ".ory/kratos/public")

		actionpath := actionURL[actionpathIdx+18:]

		req, _ = http.NewRequest("POST", viper.GetString("kratos_public_url")+actionpath, buf)
		req.Header.Set("Content-Type", "application/json")

		resp, err = client.Do(req)
		if err != nil {
			return err
		}

		var sessionBody map[string]interface{}
		var kavachUserCheckers map[string]interface{}

		if resp.StatusCode == http.StatusOK {
			json.NewDecoder(resp.Body).Decode(&sessionBody)

			sessionMap := sessionBody["session"].(map[string]interface{})

			kavachUserCheckers = map[string]interface{}{
				"extra": sessionMap,
			}
		} else {
			kavachUserCheckers = map[string]interface{}{
				"extra": map[string]interface{}{
					"identity": map[string]interface{}{
						"traits": map[string]interface{}{
							"email": viper.GetString("user.email"),
						},
					},
				},
			}
		}

		// create a user in kavach (/users/checker)
		err = json.NewEncoder(buf).Encode(&kavachUserCheckers)
		if err != nil {
			return err
		}

		req, _ = http.NewRequest("POST", viper.GetString("kavach_url")+"/users/checker", buf)
		req.Header.Set("Content-Type", "application/json")

		resp, err = client.Do(req)
		if err != nil {
			return err
		}

		if resp.StatusCode != http.StatusOK {
			return errors.New("could not create user in kavach")
		}

		// create organisation in kavach with the created user as owner
		var respBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&respBody)

		headerMap := respBody["header"].(map[string]interface{})
		userIDArr := headerMap["X-User"].([]interface{})
		userID := userIDArr[0].(string)

		org := organisation{
			Title: viper.GetString("organisation_title"),
		}

		err = json.NewEncoder(buf).Encode(&org)
		if err != nil {
			return err
		}

		req, _ = http.NewRequest("POST", viper.GetString("kavach_url")+"/organisations", buf)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-User", userID)

		resp, err = client.Do(req)

		if err != nil {
			return err
		}

		if resp.StatusCode != http.StatusCreated {
			return errors.New("could not create organisation in kavach")
		}

		var respOrganisation organisation

		json.NewDecoder(resp.Body).Decode(&respOrganisation)

		// write config file organisation object with the created organisation object (set ID)
		viper.Set("organisation.id", respOrganisation.ID)
		viper.WriteConfig()
	} else {
		return errors.New("did not create super user and organisation")
	}
	return nil
}
