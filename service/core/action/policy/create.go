package policy

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/renderx"
)

func create(w http.ResponseWriter, r *http.Request) {
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

	policyReq := &policyReq{}

	json.NewDecoder(r.Body).Decode(&policyReq)

	ketoPolicy := &model.KetoPolicy{}

	commanPolicyString := ":org:" + oID + ":app:dega:space:" + sID + ":"
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
	req, err := http.NewRequest("PUT", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies", buf)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()
	createKetoPolicy := model.KetoPolicy{}

	json.NewDecoder(resp.Body).Decode(&createKetoPolicy)

	/* User req */
	userMap := author.Mapper(oID, uID)

	result := Mapper(createKetoPolicy, userMap)

	renderx.JSON(w, http.StatusOK, result)
}
