package cmd

import (
	"errors"
	"log"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	search "github.com/factly/dega-server/util/search-service"
	"github.com/factly/x/loggerx"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(reindexCommand)
}

var reindexCommand = &cobra.Command{
	Use:   "reindex-search",
	Short: "Reindex meilisearch index if ENABLE_SEARCH_INDEXING is set true",
	Run: func(cmd *cobra.Command, args []string) {
		log.Println("meilisearch reindexing started")
		if !config.SearchEnabled() {
			loggerx.Error(errors.New("search indexing not enabled"))
		}

		config.SetupDB()

		if config.SearchEnabled() {
			searchService := search.GetSearchService()
			searchConfig, err := search.GetSearchServiceConfig()
			if err != nil {
				log.Fatal("server was not able to load search service config file")
			}

			err = searchService.Connect(searchConfig)
			if err != nil {
				log.Fatal("error in connecting to search index - either enable search or verify host, api key and other attributes")
			}

			err = searchService.DeleteAllDocuments()
			if err != nil {
				loggerx.Error(err)
				return
			}

			if err = util.ReindexAllEntities(0); err != nil {
				loggerx.Error(err)
				return
			}
		}

		loggerx.Info("meilisearch reindexed successfully")
	},
}
