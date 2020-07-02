package policy

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"

	"github.com/factly/dega-server/service/core/model"
)

// Composer create keto policy
func Composer(oID string, sID string, inputPolicy policyReq) model.KetoPolicy {
	result := model.KetoPolicy{}

	commanPolicyString := ":org:" + oID + ":app:dega:space:" + sID + ":"
	result.ID = "id" + commanPolicyString + inputPolicy.Name
	result.Description = inputPolicy.Description
	result.Effect = "allow"

	for _, each := range inputPolicy.Permissions {
		result.Resources = append(result.Resources, "resources"+commanPolicyString+each.Resource)
		var eachActions []string
		for _, action := range each.Actions {
			eachActions = append(eachActions, "actions"+commanPolicyString+each.Resource+":"+action)
		}
		result.Actions = append(result.Actions, eachActions...)
	}

	result.Subjects = inputPolicy.Users

	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(&result)
	req, err := http.NewRequest("PUT", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies", buf)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return model.KetoPolicy{}
	}

	defer resp.Body.Close()

	json.NewDecoder(resp.Body).Decode(&result)

	return result
}
