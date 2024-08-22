package config

import (
	"fmt"
	"time"

	meilisearch "github.com/meilisearch/meilisearch-go"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

// Client client for meili search server
var MeilisearchClient *meilisearch.Client
var searchable_attributes []string
var filterable_attributes []string
var sortable_attributes []string
var ranking_attributes []string
var stop_words []string

var Indexes = []string{"category", "medium", "post", "tag", "claim", "claimant", "podcast", "episode"}

var rootCmd = &cobra.Command{
	Use: "meilisearch",
}

func init() {
	rootCmd.AddCommand(setupCmd)
}

var setupCmd = &cobra.Command{
	Use:   "setup",
	Short: "Sets up MeiliSearch for the application.",
	Run: func(cmd *cobra.Command, args []string) {
		// setup MeiliSearch
		err := SetupMeiliSearch(
			[]string{"category", "medium", "post", "tag", "claim", "claimant", "podcast", "episode"},
			[]string{"name", "slug", "description", "title", "subtitle", "excerpt", "claim", "fact", "site_title", "site_address", "tag_line", "review", "review_tag_line"},
			[]string{"space_id", "status", "tag_ids", "category_ids", "author_ids", "claimant_id", "rating_id"},
			[]string{},
			[]string{},
			[]string{},
		)
		if err != nil {
			fmt.Println(err)
		}
	},
}

// SetupMeiliSearch setups the meili search server index
func SetupMeiliSearch(indexes, searchableAttributes, filterableAttributes, sortableAttributes, rankingAttritubes, stopWords []string) error {
	MeilisearchClient = meilisearch.NewClient(
		meilisearch.ClientConfig{
			Host:    viper.GetString("meili_url"),
			APIKey:  viper.GetString("meili_api_key"),
			Timeout: time.Second * 10,
		},
	)

	searchable_attributes = searchableAttributes
	filterable_attributes = filterableAttributes
	sortable_attributes = sortableAttributes
	ranking_attributes = rankingAttritubes
	stop_words = stopWords

	for _, indexName := range indexes {
		SetupMeiliIndex(indexName)
	}

	return nil
}

func SetupMeiliIndex(indexName string) error {

	_, err := MeilisearchClient.CreateIndex(&meilisearch.IndexConfig{
		Uid:        indexName,
		PrimaryKey: "object_id",
	})

	if err != nil {
		return err
	}

	// adding filterable attributes to the meilisearch instance
	_, err = MeilisearchClient.Index(indexName).UpdateFilterableAttributes(&filterable_attributes)
	if err != nil {
		return err
	}

	// Add searchable attributes in index
	_, err = MeilisearchClient.Index(indexName).UpdateSearchableAttributes(&searchable_attributes)
	if err != nil {
		return err
	}

	// Add sortable attributes in index
	_, err = MeilisearchClient.Index(indexName).UpdateSortableAttributes(&sortable_attributes)
	if err != nil {
		return err
	}
	// Add updateTypoTolerance in index
	_, err = MeilisearchClient.Index(indexName).UpdateTypoTolerance(&meilisearch.TypoTolerance{
		MinWordSizeForTypos: meilisearch.MinWordSizeForTypos{
			OneTypo:  4,
			TwoTypos: 8,
		},
	})
	if err != nil {
		return err
	}

	// Add UpdateRankingRules in index
	_, err = MeilisearchClient.Index(indexName).UpdateRankingRules(&ranking_attributes)

	if err != nil {
		return err
	}

	// Add Stop Words in index
	_, err = MeilisearchClient.Index(indexName).UpdateStopWords(&stop_words)
	if err != nil {
		return err
	}
	return nil
}
