package author

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var missingSpace = map[string]string{
	"X-User": "1",
}

var missingUser = map[string]string{
	"X-Space": "1",
}

var basePath = "/core/authors"
