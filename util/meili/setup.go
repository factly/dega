package meili

import (
	"log"

	"github.com/factly/dega-server/config"
	"github.com/meilisearch/meilisearch-go"
)

// Client client for meili search server
var Client *meilisearch.Client

// SetupMeiliSearch setups the meili search server index
func SetupMeiliSearch() {
	Client = meilisearch.NewClient(meilisearch.Config{
		Host:   config.MeiliURL,
		APIKey: config.MeiliKey,
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
}
