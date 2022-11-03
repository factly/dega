package cmd

import (
	"log"
	"net/http"

	"github.com/dlmiddlecote/sqlstats"
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/util"
	search "github.com/factly/dega-server/util/search-service"
	"github.com/go-chi/chi"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func init() {
	rootCmd.AddCommand(serveCmd)
}

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Starts server for dega-server.",
	Run: func(cmd *cobra.Command, args []string) {
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
		}

		config.SetupDB()

		if util.CheckNats() {
			util.ConnectNats()
			defer util.NC.Close()
		}

		r := service.RegisterRoutes()

		go func() {
			promRouter := chi.NewRouter()

			sqlDB, _ := config.DB.DB()
			collector := sqlstats.NewStatsCollector(viper.GetString("database_name"), sqlDB)

			prometheus.MustRegister(collector)

			promRouter.Mount("/metrics", promhttp.Handler())
			log.Fatal(http.ListenAndServe(":8001", promRouter))
		}()

		if viper.IsSet("enable_feeds") && viper.GetBool("enable_feeds") {
			go func() {
				r := service.RegisterFeedsRoutes()
				if err := http.ListenAndServe(":8002", r); err != nil {
					log.Fatal(err)
				}
			}()
		}

		if err := http.ListenAndServe(":8000", r); err != nil {
			log.Fatal(err)
		}
	},
}
