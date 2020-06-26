package policy

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func details(w http.ResponseWriter, r *http.Request) {
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

	policyID := chi.URLParam(r, "policy_id")

	ketoPolicyID := "id:org:" + oID + ":app:dega:space:" + sID + ":" + policyID

	req, err := http.NewRequest("GET", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies/"+ketoPolicyID, nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()

	/* create new policy */
	ketoPolicy := &model.Policy{}

	json.NewDecoder(resp.Body).Decode(&ketoPolicy)

	fmt.Printf("%+v", ketoPolicy)
	var permissions []permission
	for _, resource := range ketoPolicy.Resources {
		var eachRule permission

		resourcesPrefixAll := strings.Split(resource, ":")
		resourcesPrefix := strings.Join(resourcesPrefixAll[1:], ":")
		eachRule.Resource = resourcesPrefixAll[len(resourcesPrefixAll)-1]
		for _, action := range ketoPolicy.Actions {
			if strings.HasPrefix(action, "actions:"+resourcesPrefix) {
				actionSplitAll := strings.Split(action, ":")
				eachRule.Actions = append(eachRule.Actions, actionSplitAll[len(actionSplitAll)-1])
			}
		}
		fmt.Printf("%+v", eachRule)

		permissions = append(permissions, eachRule)
	}

	var result policy

	result.Name = ketoPolicy.ID
	result.Description = ketoPolicy.Description
	result.Permissions = permissions
	result.Users = ketoPolicy.Subjects

	renderx.JSON(w, http.StatusOK, result)
}
