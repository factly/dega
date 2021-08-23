package cmd

import (
	"log"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/meilisearchx"
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
			log.Fatal("Search indexing not enabled...")
		}

		config.SetupDB()

		err := meilisearchx.SetupMeiliSearch("dega", []string{"name", "slug", "description", "title", "subtitle", "excerpt", "claim", "fact", "site_title", "site_address", "tag_line", "review", "review_tag_line"})
		if err != nil {
			log.Fatal(err)
		}

		_, err = meilisearchx.Client.Documents("dega").DeleteAllDocuments()
		if err != nil {
			log.Fatal(err)
		}

		if err = util.ReindexAllEntities(0); err != nil {
			log.Fatal(err)
		}

	},
}
