package algolia

import (
	"errors"

	"github.com/algolia/algoliasearch-client-go/v3/algolia/opt"
	"github.com/algolia/algoliasearch-client-go/v3/algolia/search"
	"github.com/spf13/viper"
)

type Config struct {
	Name      string              `json:"name"`
	Host      string              `json:"host,omitempty"`
	APIkeys   map[string]string   `json:"api_keys"`
	IndexName string              `json:"index_name"`
	Settings  map[string][]string `json:"settings,omitempty"`
}

var index *search.Index

func Connect(config *Config) error {
	writeAPIKey, ok := config.APIkeys["write_api_key"]
	if !ok {
		return errors.New("write api key is not provided")
	}

	client := search.NewClient(viper.GetString("algolia_app_id"), writeAPIKey)
	index = client.InitIndex(config.IndexName)

	_, err := index.SetSettings(search.Settings{
		SearchableAttributes:  opt.SearchableAttributes(config.Settings["searchable_attributes"]...),
		AttributesForFaceting: opt.AttributesForFaceting(config.Settings["filterable_attributes"]...),
	}, opt.ForwardToReplicas(false))
	if err != nil {
		return err
	}

	return nil
}
