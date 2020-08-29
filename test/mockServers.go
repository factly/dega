package test

import (
	"net/http"
	"os"

	"gopkg.in/h2non/gock.v1"
)

// MockServer is created to intercept HTTP Calls outside this project. Mocking the external project servers helps with Unit Testing.
func MockServer() {

	// Mock server to return a user from kavach
	gock.New(os.Getenv("KAVACH_URL") + "/organisations/[0-9]+/users").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_AuthorList)

	// Creates a mock server for kavach URL with an appropriate dummy response.
	gock.New(os.Getenv("KAVACH_URL") + "/organisations").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_Org)

	// Creates a mock server for keto for provisioning Policy.Authorizer module.
	gock.New(os.Getenv("KETO_URL")).
		Post("/engines/acp/ory/regex/allowed").
		Persist().
		Reply(http.StatusOK)
}
