package config

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

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

type ketoPolicy struct {
	ID          string   `json:"id"`
	Subjects    []string `json:"subjects"`
	Actions     []string `json:"actions"`
	Resources   []string `json:"resources"`
	Effect      string   `json:"effect"`
	Description string   `json:"description"`
}

// OrganisationPermission model
type OrganisationPermission struct {
	Base
	OrganisationID uint  `gorm:"column:organisation_id" json:"organisation_id"`
	Spaces         int64 `gorm:"column:spaces" json:"spaces"`
}

var ketoPolicyPath string = "/engines/acp/ory/regex/policies"

// CheckSuperOrganisation checks if super organisation is present in kavach or not
func CheckSuperOrganisation() bool {
	// check if policy is present in keto
	req, _ := http.NewRequest("GET", viper.GetString("keto_url")+ketoPolicyPath+"/app:dega:superorg", nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}

	if resp.StatusCode != http.StatusOK {
		return false
	}
	var policy ketoPolicy
	err = json.NewDecoder(resp.Body).Decode(&policy)
	if err != nil {
		return false
	}

	if len(policy.Subjects) == 0 {
		return false
	}

	orgID := policy.Subjects[0]

	// check if organisation is present in kavach
	req, _ = http.NewRequest("GET", viper.GetString("kavach_url")+"/organisations/"+orgID, nil)
	req.Header.Set("Content-Type", "application/json")

	client = &http.Client{}
	resp, err = client.Do(req)
	if err != nil {
		return false
	}

	if resp.StatusCode == http.StatusOK {
		return true
	}

	return false
}

// UserConfigPresent checks if user config params is present in config file
func UserConfigPresent() bool {
	return viper.IsSet("default_user_email") && viper.IsSet("default_user_password") && viper.GetString("default_user_email") != "" && viper.GetString("default_user_password") != "" && viper.IsSet("super_organisation_title")
}

// CreateSuperOrganisation creates a super user and organisation in kavach
func CreateSuperOrganisation() error {
	if viper.GetBool("create_super_organisation") && !CheckSuperOrganisation() && UserConfigPresent() {
		// create a user in kratos through api
		resp, err := createKratosUser()
		if err != nil {
			return err
		}

		var sessionBody map[string]interface{}
		var kavachUserCheckers map[string]interface{}

		if resp.StatusCode == http.StatusOK {
			_ = json.NewDecoder(resp.Body).Decode(&sessionBody)

			sessionMap := sessionBody["session"].(map[string]interface{})

			kavachUserCheckers = map[string]interface{}{
				"extra": sessionMap,
			}
		} else {
			kavachUserCheckers = map[string]interface{}{
				"extra": map[string]interface{}{
					"identity": map[string]interface{}{
						"traits": map[string]interface{}{
							"email": viper.GetString("default_user_email"),
						},
					},
				},
			}
		}

		// create or fetch user in kavach at /users/checker
		resp, err = createKavachUser(kavachUserCheckers)
		if err != nil {
			return err
		}

		// create organisation in kavach with the created user as owner
		var respBody map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&respBody)
		if err != nil {
			return err
		}

		headerMap := respBody["header"].(map[string]interface{})
		userIDArr := headerMap["X-User"].([]interface{})
		userID := userIDArr[0].(string)

		resp, err = createKavachOrganisation(userID)
		if err != nil {
			return err
		}

		var respOrganisation organisation

		err = json.NewDecoder(resp.Body).Decode(&respOrganisation)
		if err != nil {
			return err
		}

		// create permissions for super organisation
		err = createSuperOrganisationPermissions(respOrganisation.ID)
		if err != nil {
			return err
		}

		// create keto policy for super organisation
		_, err = createKetoPolicy(respOrganisation.ID)
		if err != nil {
			return err
		}
	} else {
		return errors.New("did not create super user and organisation")
	}
	return nil
}

func createKratosUser() (*http.Response, error) {
	req, _ := http.NewRequest("GET", viper.GetString("kratos_public_url")+"/self-service/registration/api", nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	var body flowInitResponse

	_ = json.NewDecoder(resp.Body).Decode(&body)

	var actionURL string
	passwordMap := body.Methods.Password

	if config, found := passwordMap["config"]; found {
		configMap := config.(map[string]interface{})
		if action, found := configMap["action"]; found {
			actionURL = action.(string)
		}
	}

	userCredsBody := map[string]interface{}{
		"traits.email": viper.GetString("default_user_email"),
		"password":     viper.GetString("default_user_password"),
	}

	buf := new(bytes.Buffer)
	err = json.NewEncoder(buf).Encode(&userCredsBody)
	if err != nil {
		return nil, err
	}

	req, _ = http.NewRequest("POST", actionURL, buf)
	if viper.IsSet("oathkeeper_host") {
		req.URL.Host = viper.GetString("oathkeeper_host")
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err = client.Do(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func createKavachUser(kavachUserCheckers map[string]interface{}) (*http.Response, error) {
	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&kavachUserCheckers)
	if err != nil {
		return nil, err
	}

	req, _ := http.NewRequest("POST", viper.GetString("kavach_url")+"/users/checker", buf)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("could not create user in kavach")
	}
	return resp, nil
}

func createKavachOrganisation(userID string) (*http.Response, error) {
	org := organisation{
		Title: viper.GetString("super_organisation_title"),
	}

	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&org)
	if err != nil {
		return nil, err
	}

	req, _ := http.NewRequest("POST", viper.GetString("kavach_url")+"/organisations", buf)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User", userID)

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusCreated {
		return nil, errors.New("could not create organisation in kavach")
	}
	return resp, nil
}

func createSuperOrganisationPermissions(oID uint) error {
	return DB.Model(&OrganisationPermission{}).Create(&OrganisationPermission{
		OrganisationID: oID,
		Spaces:         -1,
	}).Error
}

func createKetoPolicy(organisationID uint) (*http.Response, error) {
	policy := ketoPolicy{
		ID:        "app:dega:superorg",
		Subjects:  []string{fmt.Sprint(organisationID)},
		Resources: []string{fmt.Sprint("resources:org:", organisationID, ":<.*>")},
		Actions:   []string{fmt.Sprint("actions:org:", organisationID, ":<.*>")},
		Effect:    "allow",
	}

	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&policy)
	if err != nil {
		return nil, err
	}

	req, _ := http.NewRequest("PUT", viper.GetString("keto_url")+ketoPolicyPath, buf)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("could not create keto policy")
	}
	return resp, nil
}
