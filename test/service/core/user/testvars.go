package user

var path string = "/core/users"
var permissionAllPath string = "/core/users/permissions"

var headers = map[string]string{
	"X-User":  "1",
	"X-Space": "1",
}

var allPermissionResponse = []map[string]interface{}{
	map[string]interface{}{
		"id":         2,
		"deleted_at": nil,
		"email":      "def@def.com",
		"first_name": "def",
		"last_name":  "fed",
		"gender":     "male",
	},
}
