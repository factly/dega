package policy

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

func list(w http.ResponseWriter, r *http.Request) {
	req, err := http.NewRequest("GET", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies", nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()

	var polices []model.Policy

	json.NewDecoder(resp.Body).Decode(&polices)

	spaceID := chi.URLParam(r, "space_id")

	organisationID := r.Header.Get("X-Organisation")

	prefixName := "id:org:" + organisationID + ":app:dega:space:" + spaceID + ":"

	var onlyOrgPolicy []model.Policy

	for _, each := range polices {
		if strings.HasPrefix(each.ID, prefixName) {
			onlyOrgPolicy = append(onlyOrgPolicy, each)
		}
	}

	var result []policy

	for _, each := range onlyOrgPolicy {
		var eachPermissions []permission
		for _, resource := range each.Resources {
			var eachRule permission

			resourcesPrefixAll := strings.Split(resource, ":")
			resourcesPrefix := strings.Join(resourcesPrefixAll[1:], ":")
			eachRule.Resource = resourcesPrefixAll[len(resourcesPrefixAll)-1]
			for _, action := range each.Actions {
				if strings.HasPrefix(action, "actions:"+resourcesPrefix) {
					actionSplitAll := strings.Split(action, ":")
					eachRule.Actions = append(eachRule.Actions, actionSplitAll[len(actionSplitAll)-1])
				}
			}

			eachPermissions = append(eachPermissions, eachRule)
		}

		var eachPolicy policy
		nameAll := strings.Split(each.ID, ":")
		eachPolicy.Name = nameAll[len(nameAll)-1]
		eachPolicy.Description = each.Description
		eachPolicy.Permissions = eachPermissions
		eachPolicy.Users = each.Subjects

		result = append(result, eachPolicy)
	}

	render.JSON(w, http.StatusOK, result)
}
