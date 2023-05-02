package cmd

import (
	"fmt"
	"log"
	"net/http"

	"github.com/dlmiddlecote/sqlstats"
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/meilisearchx"
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
		// db setup
		config.SetupDB()

		if config.SearchEnabled() {
			meiliIndex := viper.GetString("MEILISEARCH_INDEX")
			err := meilisearchx.SetupMeiliSearch(meiliIndex, []string{"space_id", "name", "slug", "description", "title", "subtitle", "excerpt", "claim", "fact", "site_title", "site_address", "tag_line", "review", "review_tag_line"}, []string{"kind", "space_id", "status", "tag_ids", "category_ids", "author_ids", "claimant_id", "rating_id"})
			if err != nil {
				fmt.Println(err)
			}
		}

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
