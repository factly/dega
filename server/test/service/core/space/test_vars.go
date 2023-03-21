package space

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var invalidData = map[string]interface{}{
	"spa": 1,
}

const path string = "/core/spaces/{space_id}"
const basePath string = "/core/spaces"

var TestSpaceName = "Test Space"
var TestSpaceSlug = "test-space"
var TestSpaceDescription = "Test Space Description"
var TestSpaceOrganisationID = 1
var TestSpaceApplicationID = 1

var SpaceData = map[string]interface{}{
	"name":            TestSpaceName,
	"slug":            TestSpaceSlug,
	"description":     TestSpaceDescription,
	"organisation_id": TestSpaceOrganisationID,
	"application_id":  TestSpaceApplicationID,
}
