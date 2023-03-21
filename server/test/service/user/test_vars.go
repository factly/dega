package user

var path string = "/core/users"
var headers = map[string]string{
	"X-User":  "1",
	"X-Space": "1",
}

var permissionPath string = "/core/users/{user_id}/permissions"

var permissionsResponse = []map[string]interface{}{
	{
		"resource": "tags",
		"actions":  []string{"update", "delete"},
	},
	{
		"resource": "categories",
		"actions":  []string{"get", "create"},
	},
}

var adminPermissionsResponse = map[string]interface{}{
	"resource": "admin",
	"actions":  []string{"admin"},
}
