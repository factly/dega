package policy

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var invalidHeader = map[string]string{
	"X-Space": "1",
}

// valid policy
var policy_test = map[string]interface{}{
	"name": "test policy",
	"permissions": []map[string]interface{}{
		{
			"resource": "policies",
			"actions":  []string{"get", "create", "update", "delete"},
		},
	},
	"users": []string{
		"test@test.com",
	},
}

var basePath = "/core/policies"
var defaultsPath = "/core/policies/default"
var path = "/core/policies/{policy_id}"
