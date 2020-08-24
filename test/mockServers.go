package test

import (
	"net/http"
	"os"
	"strconv"
	"time"

	"gopkg.in/h2non/gock.v1"
)

// Mock Servers are created to intercept HTTP Calls outside this project. Mocking the external project servers helps with Unit Testing.
func MockServer() {
	org, _ := strconv.Atoi(os.Getenv("ORG_ID"))
	user, _ := strconv.Atoi(os.Getenv("USER_ID"))

	// Creates a mock server for kavach URL with an appropriate dummy response.
	gock.New(os.Getenv("KAVACH_URL")).
		Get("/organisations").
		Persist().
		Reply(http.StatusOK).
		JSON(map[string]interface{}{
			"id":         org,
			"created_at": time.Now(),
			"updated_at": time.Now(),
			"deleted_at": nil,
			"title":      "test org",
			"permission": map[string]interface{}{
				"id":              1,
				"created_at":      time.Now(),
				"updated_at":      time.Now(),
				"deleted_at":      nil,
				"user_id":         user,
				"user":            nil,
				"organisation_id": org,
				"organisation":    nil,
				"role":            "owner",
			},
		})

	// Creates a mock server for keto for provisioning Policy.Authorizer module.
	gock.New(os.Getenv("KETO_URL")).
		Post("/engines/acp/ory/regex/allowed").
		Persist().
		Reply(http.StatusOK)
}
