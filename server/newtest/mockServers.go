package newtest

import (
	"net/http"

	"github.com/factly/dega-server/service/fact-check/action/google"
	"github.com/nats-io/gnatsd/server"
	gnatsd "github.com/nats-io/gnatsd/test"
	"github.com/nats-io/go-nats"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func MockServer() {
	viper.Set("kavach_url", "http://kavach:6620")
	viper.Set("keto_url", "http://keto:6644")
	viper.Set("keto_read_api_url", "http://keto:4466")
	viper.Set("meili_url", "http://0.0.0.0:7700")
	viper.Set("meili_api_key", "password")
	viper.Set("create_super_organisation", true)
	viper.Set("nats_url", "nats://127.0.0.1:4222")
	viper.Set("enable_hukz", false)
	viper.Set("enable_search_indexing", false)
	viper.Set("templates_path", "../../../../web/templates/*")
	viper.Set("MEILISEARCH_INDEX", "dega-test")
	google.GoogleURL = "http://googlefactchecktest.com"

	// meilisearchx.Client = meilisearch.NewClient(meilisearch.ClientConfig{
	// 	Host:   viper.GetString("meili_url"),
	// 	APIKey: viper.GetString("meili_key"),
	// })
	// meiliIndex := viper.GetString("MEILISEARCH_INDEX")
	// err := meilisearchx.SetupMeiliSearch(meiliIndex, []string{"space_id", "name", "slug", "description", "title", "subtitle", "excerpt", "claim", "fact", "site_title", "site_address", "tag_line", "review", "review_tag_line"}, []string{"kind", "space_id", "status", "tag_ids", "category_ids", "author_ids", "claimant_id", "rating_id"})
	// if err != nil {
	// 	log.Fatal(err)
	// }
	KavachGock()
	KetoGock()
}

func KavachGock() {
	gock.New(viper.GetString("kavach_url") + "/organisations/[0-9]+/applications/[0-9]+/spaces/[0-9]+/users").Persist().Get("/").Reply(http.StatusOK).JSON(Dummy_AuthorList)

	// Mock server to return a user from kavach
	gock.New(viper.GetString("kavach_url") + "/organisations/[0-9]+/users").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_AuthorList)

	gock.New(viper.GetString("kavach_url") + "/organisations/my").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_OrgList)

	// Creates a mock server for kavach URL with an appropriate dummy response

	gock.New(viper.GetString("kavach_url") + "/organisations").
		Persist().
		Reply(http.StatusOK).
		JSON(PaiganatedOrg)

	// Creates a mock server for kavach URL with an appropriate dummy response.
	gock.New(viper.GetString("kavach_url") + "/organisations/[0-9]+/applications/dega/access").
		Persist().
		Reply(http.StatusOK)

	gock.New(viper.GetString("kavach_url") + "/util/space/1/getOrganisation").Persist().Reply(http.StatusOK).JSON(map[string]interface{}{
		"organisation_id": 1,
	})

	gock.New(viper.GetString("kavach_url") + "/util/application/").Persist().Reply(http.StatusOK).JSON(map[string]interface{}{
		"application_id": 1,
	})
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

	gock.New(viper.GetString("keto_read_api_url") + "/relation-tuples/check").
		Persist().
		Reply(http.StatusOK).
		JSON(map[string]interface{}{
			"allowed": true,
		})
}

func GoogleFactCheckGock() {
	gock.New(google.GoogleURL).
		Persist().
		Reply(http.StatusOK).
		JSON(GoogleResponse)
}

func IFramelyGock() {
	viper.Set("iframely_url", "http://iframely:8061")
	gock.New(viper.GetString("iframely_url")).
		Get("/oembed").
		ParamPresent("url").
		Persist().
		Reply(http.StatusOK).
		JSON(OembedResponse)

	gock.New(viper.GetString("iframely_url")).
		Get("/iframely").
		ParamPresent("url").
		Persist().
		Reply(http.StatusOK).
		JSON(IFramelyResponse)
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
	KetoGock()

	gock.New(serverURL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
}

func DisableKetoGock(serverURL string) {
	gock.Off()
	KavachGock()

	gock.New(serverURL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
}

// RunDefaultNATSServer will run a nats server on the default port.
func RunDefaultNATSServer() *server.Server {
	return RunServerOnPort(nats.DefaultPort)
}

// RunServerOnPort will run a server on the given port.
func RunServerOnPort(port int) *server.Server {
	opts := gnatsd.DefaultTestOptions
	opts.Port = port
	return RunServerWithOptions(opts)
}

// RunServerWithOptions will run a server with the given options.
func RunServerWithOptions(opts server.Options) *server.Server {
	return gnatsd.RunServer(&opts)
}

// RunServerWithConfig will run a server with the given configuration file.
func RunServerWithConfig(configFile string) (*server.Server, *server.Options) {
	return gnatsd.RunServerWithConfig(configFile)
}
