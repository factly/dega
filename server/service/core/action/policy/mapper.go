package policy

import (
	"strings"

	"github.com/factly/dega-server/service/core/model"
)

// Mapper map policy
func Mapper(ketoPolicy model.KetoPolicy, userMap map[string]model.Author) model.Policy {
	permissions := make([]model.Permission, 0)
	for _, resource := range ketoPolicy.Resources {
		var eachRule model.Permission

		resourcesPrefixAll := strings.Split(resource, ":")
		resourcesPrefix := strings.Join(resourcesPrefixAll[1:], ":")
		eachRule.Resource = resourcesPrefixAll[len(resourcesPrefixAll)-1]
		eachRule.Actions = make([]string, 0)

		for _, action := range ketoPolicy.Actions {
			if strings.HasPrefix(action, "actions:"+resourcesPrefix) {
				actionSplitAll := strings.Split(action, ":")
				eachRule.Actions = append(eachRule.Actions, actionSplitAll[len(actionSplitAll)-1])
			}
		}

		permissions = append(permissions, eachRule)
	}

	authors := make([]model.Author, 0)
	for _, user := range ketoPolicy.Subjects {
		val, exists := userMap[user]
		if exists {
			authors = append(authors, val)
		}
	}

	var result model.Policy
	nameAll := strings.Split(ketoPolicy.ID, ":")
	result.ID = nameAll[len(nameAll)-1]
	result.Name = nameAll[len(nameAll)-1]
	result.Description = ketoPolicy.Description
	result.Permissions = permissions
	result.Users = authors

	return result
}

// GetPermissions gives permissions from policy for given userID
func GetPermissions(ketoPolicy model.KetoPolicy, userID uint) []model.Permission {
	permissions := make([]model.Permission, 0)
	for _, resource := range ketoPolicy.Resources {
		var eachRule model.Permission

		resourcesPrefixAll := strings.Split(resource, ":")
		resourcesPrefix := strings.Join(resourcesPrefixAll[1:], ":")
		eachRule.Resource = resourcesPrefixAll[len(resourcesPrefixAll)-1]
		eachRule.Actions = make([]string, 0)

		for _, action := range ketoPolicy.Actions {
			if strings.HasPrefix(action, "actions:"+resourcesPrefix) {
				actionSplitAll := strings.Split(action, ":")
				eachRule.Actions = append(eachRule.Actions, actionSplitAll[len(actionSplitAll)-1])
			}
		}

		permissions = append(permissions, eachRule)
	}

	return permissions
}

// GetAllPolicies gives list of all keto policies
func GetAllPolicies() ([]model.KetoPolicy, error) {
	policyLists := []model.KetoPolicy{}
	return policyLists, nil
}
