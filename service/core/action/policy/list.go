package policy

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

type paging struct {
	Total int      `json:"total"`
	Nodes []policy `json:"nodes"`
}

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

	sID, err := util.GetSpace(r.Context())

	if err != nil {
		return
	}

	space := &model.Space{}
	space.ID = uint(sID)

	err = config.DB.First(&space).Error

	if err != nil {
		return
	}

	prefixName := "id:org:" + strconv.Itoa(space.OrganisationID) + ":app:dega:space:" + strconv.Itoa(sID) + ":"
	var onlyOrgPolicy []model.Policy

	for _, each := range polices {
		if strings.HasPrefix(each.ID, prefixName) {
			onlyOrgPolicy = append(onlyOrgPolicy, each)
		}
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	total := len(onlyOrgPolicy)
	lowerLimit := offset
	upperLimit := offset + limit
	if offset > total {
		lowerLimit = 0
		upperLimit = 0
	} else if offset+limit > total {
		lowerLimit = offset
		upperLimit = total
	}

	total = len(onlyOrgPolicy)

	onlyOrgPolicy = onlyOrgPolicy[lowerLimit:upperLimit]

	var pagePolicies []policy

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

		pagePolicies = append(pagePolicies, eachPolicy)
	}

	var result paging
	result.Nodes = pagePolicies
	result.Total = total
	renderx.JSON(w, http.StatusOK, result)
}
