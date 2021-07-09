package search

var headers = map[string]string{
	"X-User":  "1",
	"X-Space": "1",
}

var Data = map[string]interface{}{
	"q":       "test",
	"limit":   10,
	"filters": "kind=category",
}

var undecodableData = map[string]interface{}{
	"q":     10,
	"limit": "10",
}

var invalidData = map[string]interface{}{
	"q":       "te",
	"limit":   100,
	"filters": "kind=category",
}

var path string = "/core/search"
