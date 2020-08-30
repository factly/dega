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

	gock.New(os.Getenv("KAVACH_URL") + "/organisations/my").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_OrgList)

	// Creates a mock server for kavach URL with an appropriate dummy response.
	gock.New(os.Getenv("KAVACH_URL") + "/organisations").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_Org)

	// <----- ALL THE KETO POLICIES (FOR POLICY TEST)------>
	// GET-details for single id,
	gock.New(os.Getenv("KETO_URL")).
		Get("/engines/acp/ory/regex/policies/(.+)").
		SetMatcher(gock.NewMatcher()).
		AddMatcher(func(req *http.Request, ereq *gock.Request) (bool, error) { return req.Method == "GET", nil }).
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_SingleMock)

	// DELETE AND UPDATE POLICY - get specific policy, delete and put
	gock.New(os.Getenv("KETO_URL")).
		Put("/engines/acp/ory/regex/policies/(.+)").
		SetMatcher(gock.NewMatcher()).
		AddMatcher(func(req *http.Request, ereq *gock.Request) (bool, error) {
			if req.Method == "PUT" || req.Method == "DELETE" {
				return true, nil
			}

			return false, nil
		}).
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_KetoPolicy)

	gock.New(os.Getenv("KETO_URL")).
		Delete("/engines/acp/ory/regex/policies/(.+)").
		SetMatcher(gock.NewMatcher()).
		AddMatcher(func(req *http.Request, ereq *gock.Request) (bool, error) {
			if req.Method == "PUT" || req.Method == "DELETE" {
				return true, nil
			}

			return false, nil
		}).
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_KetoPolicy)

		// GET and POST POLICY - returns a list of policies and post policy
	gock.New(os.Getenv("KETO_URL") + "/engines/acp/ory/regex/policies").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_KetoPolicy)

	// Creates a mock server for keto for provisioning Policy.Authorizer module.
	gock.New(os.Getenv("KETO_URL")).
		Post("/engines/acp/ory/regex/allowed").
		Persist().
		Reply(http.StatusOK)
}
