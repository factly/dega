package policy

import (
	"bytes"
	"encoding/json"
	"fmt"
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

	userID, err := util.GetUser(r.Context())

	if err != nil {
		return
	}

	space := &model.Space{}
	space.ID = uint(spaceID)

	err = config.DB.First(&space).Error

	if err != nil {
		return
	}

	uID := strconv.Itoa(userID)
	oID := strconv.Itoa(space.OrganisationID)
	sID := strconv.Itoa(spaceID)

	/* delete old policy */

	commanPolicyString := ":org:" + oID + ":app:dega:space:" + sID + ":"
	policyID := chi.URLParam(r, "policy_id")

	policyID = "id" + commanPolicyString + policyID

	req, err := http.NewRequest("DELETE", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies/"+policyID, nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()

	/* create new policy */
	policyReq := &policyReq{}

	json.NewDecoder(r.Body).Decode(&policyReq)

	ketoPolicy := &model.Policy{}

	ketoPolicy.ID = "id" + commanPolicyString + policyReq.Name
	ketoPolicy.Description = policyReq.Description
	ketoPolicy.Effect = "allow"

	for _, each := range policyReq.Permissions {
		ketoPolicy.Resources = append(ketoPolicy.Resources, "resources"+commanPolicyString+each.Resource)
		var eachActions []string
		for _, action := range each.Actions {
			eachActions = append(eachActions, "actions"+commanPolicyString+each.Resource+":"+action)
		}
		ketoPolicy.Actions = append(ketoPolicy.Actions, eachActions...)
	}

	ketoPolicy.Subjects = policyReq.Users

	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(&ketoPolicy)
	req, err = http.NewRequest("PUT", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies", buf)
	req.Header.Set("Content-Type", "application/json")

	client = &http.Client{}
	resp, err = client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()
	ioutil.ReadAll(resp.Body)

	/* User req */
	req, err = http.NewRequest("GET", os.Getenv("KAVACH_URL")+"/organizations/"+oID+"/users", nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User", uID)
	client = &http.Client{}
	resp, err = client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()

	users := []model.Author{}
	json.NewDecoder(resp.Body).Decode(&users)

	userMap := make(map[string]model.Author)

	for _, u := range users {
		userMap[fmt.Sprint(u.ID)] = u
	}

	result := policy{}

	result.Name = policyReq.Name
	result.Description = policyReq.Description
	result.Permissions = policyReq.Permissions

	authors := make([]model.Author, 0)

	for _, user := range ketoPolicy.Subjects {
		val, exists := userMap[user]
		if exists {
			authors = append(authors, val)
		}
	}

	result.Users = authors

	renderx.JSON(w, http.StatusOK, result)
}
