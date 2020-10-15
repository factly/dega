package meta

import "github.com/gavv/httpexpect"

var headers = map[string]string{
	"X-User":  "1",
	"X-Space": "1",
}

var path = "/core/meta"

var siteUrl = "http://localhost"

var page = `
<html lang="en">
  <head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width">
  
	<title>Test title</title>
	<meta name="description" content="This is a test webpage">
	<meta property="og:image" content="https://testsite.com/test.png" />
	<meta property="og:site_name" content="TestSite" />
	<meta property="og:type" content="object" />
	<meta property="og:title" content="A Test Website" />
	<meta property="og:url" content="https://testsite.com" />
  <head>
</html>`

var meta = map[string]interface{}{
	"site_name":   "TestSite",
	"description": "This is a test webpage",
	"title":       "A Test Website",
}

func checkContents(res *httpexpect.Object) {
	res.Value("meta").
		Object().
		ContainsMap(meta)

	res.Value("success").
		Number().
		Equal(1)
}
