package policy

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/spf13/viper"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/loggerx"
)

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

// Composer create keto policy
func Composer(oID int, sID int, inputPolicy policyReq) model.KetoPolicy {
	allowedResources := []string{"categories", "formats", "media", "policies", "posts", "pages", "tags", "claims", "claimants", "fact-checks", "ratings", "google", "menus", "episodes", "podcasts"}
	allowedActions := []string{"get", "create", "update", "delete", "publish"}
	result := model.KetoPolicy{}

	commanPolicyString := fmt.Sprint(":org:", oID, ":app:dega:space:", sID, ":")
	result.ID = "id" + commanPolicyString + inputPolicy.Name
	result.Description = inputPolicy.Description
	result.Effect = "allow"
	result.Resources = make([]string, 0)
	result.Actions = make([]string, 0)

	for _, each := range inputPolicy.Permissions {
		if contains(allowedResources, each.Resource) {
			result.Resources = append(result.Resources, "resources"+commanPolicyString+each.Resource)
			var eachActions []string
			for _, action := range each.Actions {
				if contains(allowedActions, action) {
					eachActions = append(eachActions, "actions"+commanPolicyString+each.Resource+":"+action)
				}
			}
			result.Actions = append(result.Actions, eachActions...)
		}
	}

	result.Subjects = inputPolicy.Users

	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&result)
	if err != nil {
		loggerx.Error(err)
	}

	req, err := http.NewRequest("PUT", viper.GetString("keto_url")+"/engines/acp/ory/regex/policies", buf)
	if err != nil {
		loggerx.Error(err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return model.KetoPolicy{}
	}

	defer resp.Body.Close()

	err = json.NewDecoder(resp.Body).Decode(&result)

	if err != nil {
		loggerx.Error(err)
	}

	return result
}
