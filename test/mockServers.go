package test

import (
	"net/http"

	"github.com/factly/dega-server/service/fact-check/action/google"
	"github.com/spf13/viper"

	"gopkg.in/h2non/gock.v1"
)

// MockServer is created to intercept HTTP Calls outside this project. Mocking the external project servers helps with Unit Testing.
func MockServer() {
	KavachGock()
	KetoGock()
	MeiliGock()
}

func KavachGock() {
	// Mock server to return a user from kavach
	gock.New(viper.GetString("kavach_url") + "/organisations/[0-9]+/users").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_AuthorList)

	gock.New(viper.GetString("kavach_url") + "/organisations/my").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_OrgList)

	// Creates a mock server for kavach URL with an appropriate dummy response.
	gock.New(viper.GetString("kavach_url") + "/organisations").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_Org)

}

func KetoGock() {
	// <----- ALL THE KETO POLICIES (FOR POLICY TEST)------>
	// GET-details for single id,
	gock.New(viper.GetString("keto_url")).
		Get("/engines/acp/ory/regex/policies/(.+)").
		SetMatcher(gock.NewMatcher()).
		AddMatcher(func(req *http.Request, ereq *gock.Request) (bool, error) { return req.Method == "GET", nil }).
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_SingleMock)

	// DELETE AND UPDATE POLICY - get specific policy, delete and put
	gock.New(viper.GetString("keto_url")).
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

	gock.New(viper.GetString("keto_url")).
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
	gock.New(viper.GetString("keto_url") + "/engines/acp/ory/regex/policies").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_KetoPolicy)

	gock.New(viper.GetString("keto_url") + "/engines/acp/ory/regex/roles/(.+)").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_Role)

	// Creates a mock server for keto for provisioning Policy.Authorizer module.
	gock.New(viper.GetString("keto_url")).
		Post("/engines/acp/ory/regex/allowed").
		Persist().
		Reply(http.StatusOK)
}

func MeiliGock() {
	gock.New(viper.GetString("meili_url") + "/indexes/dega/search").
		HeaderPresent("X-Meili-API-Key").
		Persist().
		Reply(http.StatusOK).
		JSON(MeiliHits)

	gock.New(viper.GetString("meili_url")).
		Post("/indexes/dega/documents").
		HeaderPresent("X-Meili-API-Key").
		Persist().
		Reply(http.StatusAccepted).
		JSON(ReturnUpdate)

	gock.New(viper.GetString("meili_url")).
		Put("/indexes/dega/documents").
		HeaderPresent("X-Meili-API-Key").
		Persist().
		Reply(http.StatusAccepted).
		JSON(ReturnUpdate)

	gock.New(viper.GetString("meili_url")).
		Delete("/indexes/dega/documents/(.+)").
		HeaderPresent("X-Meili-API-Key").
		Persist().
		Reply(http.StatusAccepted).
		JSON(ReturnUpdate)
}

func GoogleFactCheckGock() {

	gock.New(google.GoogleURL).
		Persist().
		Reply(http.StatusOK).
		JSON(GoogleResponse)

}

func DisableMeiliGock(serverURL string) {
	gock.Off()

	KavachGock()
	KetoGock()

	gock.New(serverURL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
}

func DisableKavachGock(serverURL string) {
	gock.Off()

	MeiliGock()
	KetoGock()

	gock.New(serverURL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
}

func DisableKetoGock(serverURL string) {
	gock.Off()

	MeiliGock()
	KavachGock()

	gock.New(serverURL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
}
