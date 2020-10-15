package meili

import (
	"log"
	"net/http"
	"time"

	"github.com/meilisearch/meilisearch-go"
	"github.com/spf13/viper"
)

// Client client for meili search server
var Client *meilisearch.Client

// SetupMeiliSearch setups the meili search server index
func SetupMeiliSearch() {
	Client = meilisearch.NewClientWithCustomHTTPClient(meilisearch.Config{
		Host:   viper.GetString("meili.url"),
		APIKey: viper.GetString("meili.key"),
	}, http.Client{
		Timeout: time.Second * 10,
	})

	_, err := Client.Indexes().Get("dega")
	if err != nil {
		_, err = Client.Indexes().Create(meilisearch.CreateIndexRequest{
			UID:        "dega",
			PrimaryKey: "object_id",
		})
		if err != nil {
			log.Fatal(err)
		}
	}

	_, err = Client.Settings("dega").UpdateAttributesForFaceting([]string{"kind"})
	if err != nil {
		log.Fatal(err)
	}

	// Add searchable attributes in index
	searchableAttributes := []string{"name", "slug", "description", "title", "subtitle", "excerpt", "site_title", "site_address", "tag_line", "review", "review_tag_line"}
	_, err = Client.Settings("dega").UpdateSearchableAttributes(searchableAttributes)
	if err != nil {
		log.Fatal(err)
	}
}
