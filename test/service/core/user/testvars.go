package user

var path string = "/core/users"
var permissionPath string = "/core/users/permissions"

var headers = map[string]string{
	"X-User":  "1",
	"X-Space": "1",
}

var permissionsResponse = []map[string]interface{}{
	map[string]interface{}{
		"resource": "tags",
		"actions":  []string{"update", "delete"},
	},
	map[string]interface{}{
		"resource": "categories",
		"actions":  []string{"get", "create"},
	},
}

var adminPermissionsResponse = map[string]interface{}{
	"resource": "all",
	"actions":  []string{"all"},
}
