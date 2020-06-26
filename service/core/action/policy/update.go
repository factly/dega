package policy

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func update(w http.ResponseWriter, r *http.Request) {
	spaceID, err := util.GetSpace(r.Context())

	if err != nil {
		return
	}

	space := &model.Space{}
	space.ID = uint(spaceID)

	err = config.DB.First(&space).Error

	if err != nil {
		return
	}

	oID := strconv.Itoa(space.OrganisationID)
	sID := strconv.Itoa(spaceID)

	/* delete old policy */
	policyID := chi.URLParam(r, "policy_id")

	policyID = "id:org:" + oID + ":app:dega:space:" + sID + ":" + policyID

	req, err := http.NewRequest("DELETE", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies/"+policyID, nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()

	/* create new policy */
	policy := &policy{}

	json.NewDecoder(r.Body).Decode(&policy)

	result := &model.Policy{}

	result.ID = "id:org:" + oID + ":app:dega:space:" + sID + ":" + policy.Name
	result.Description = policy.Description
	result.Effect = "allow"

	for _, each := range policy.Permissions {
		resourceName := "org:" + oID + ":app:dega:space:" + sID + ":" + each.Resource
		result.Resources = append(result.Resources, "resources:"+resourceName)
		var eachActions []string
		for _, action := range each.Actions {
			eachActions = append(eachActions, "actions:"+resourceName+":"+action)
		}
		result.Actions = append(result.Actions, eachActions...)
	}

	result.Subjects = policy.Users

	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(&result)
	req, err = http.NewRequest("PUT", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies", buf)
	req.Header.Set("Content-Type", "application/json")

	client = &http.Client{}
	resp, err = client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()
	ioutil.ReadAll(resp.Body)

	renderx.JSON(w, http.StatusOK, policy)
}
