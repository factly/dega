package cmd

import (
	"errors"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/loggerx"
	"github.com/google/uuid"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(reindexCommand)
}

var reindexCommand = &cobra.Command{
	Use:   "reindex-search",
	Short: "Reindex meilisearch index if ENABLE_SEARCH_INDEXING is set true",
	Run: func(cmd *cobra.Command, args []string) {
		if !config.SearchEnabled() {
			loggerx.Error(errors.New("search indexing not enabled"))
		}

		config.SetupDB()

		err := config.SetupMeiliSearch(config.Indexes, []string{"name", "slug", "description", "title", "subtitle", "excerpt", "claim", "fact", "site_title", "site_address", "tag_line", "review", "review_tag_line"}, []string{"space_id", "status", "tag_ids", "category_ids", "author_ids", "claimant_id", "rating_id"}, []string{}, []string{}, []string{})
		if err != nil {
			loggerx.Error(err)
		}

		for _, indexName := range config.Indexes {
			_, err = config.MeilisearchClient.Index(indexName).DeleteAllDocuments()
			if err != nil {
				loggerx.Error(err)
			}
		}

		if err = util.ReindexAllEntities(uuid.Nil); err != nil {
			loggerx.Error(err)
		}

	},
}
