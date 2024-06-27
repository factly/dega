package config

import (
	"time"

	meilisearch "github.com/meilisearch/meilisearch-go"
	"github.com/spf13/viper"
)

// Client client for meili search server
var MeilisearchClient *meilisearch.Client

// SetupMeiliSearch setups the meili search server index
func SetupMeiliSearch(indexName string, searchableAttributes []string, filterableAttributes []string) error {
	MeilisearchClient = meilisearch.NewClient(
		meilisearch.ClientConfig{
			Host:    viper.GetString("meili_url"),
			APIKey:  viper.GetString("meili_api_key"),
			Timeout: time.Second * 10,
		},
	)

	_, err := MeilisearchClient.GetIndex(indexName)
	if err != nil {
		_, err = MeilisearchClient.CreateIndex(&meilisearch.IndexConfig{
			Uid:        indexName,
			PrimaryKey: "object_id",
		})

		if err != nil {
			return err
		}
	}

	// adding filterable attributes to the meilisearch instance
	_, err = MeilisearchClient.Index(indexName).UpdateFilterableAttributes(&filterableAttributes)
	if err != nil {
		return err
	}

	// Add searchable attributes in index
	_, err = MeilisearchClient.Index(indexName).UpdateSearchableAttributes(&searchableAttributes)
	if err != nil {
		return err
	}
	return nil
}
