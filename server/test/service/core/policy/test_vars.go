package policy

import "github.com/factly/dega-server/service/core/model"

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var invalidHeader = map[string]string{
	"X-Space": "1",
}

// valid policy
var policy_test = map[string]interface{}{
	"name": "new policy",
	"permissions": []map[string]interface{}{
		{
			"resource": "policies",
			"actions":  []string{"get", "create", "update", "delete"},
		},
	},
	"roles": []uint{5},
}

var TestName = "test policy"
var TestPermissions []model.Permission = []model.Permission{
	{
		Resource: "test",
		Actions:  []string{"create", "update"},
	}, {
		Resource: "test2",
		Actions:  []string{"create", "update"},
	},
}

var TestUsers = []uint{
	1,
}

var TestDescription = "test description"

var undecodable_policy = map[string]interface{}{
	"name":        "test policy",
	"permissions": "none",
	"users": []string{
		"test@test.com",
	},
}

var basePath = "/core/policies"
var defaultsPath = "/core/policies/default"
var path = "/core/policies/{policy_id}"
