package main

import (
	"log"
	"net/http"

	"github.com/dlmiddlecote/sqlstats"
	"github.com/factly/dega-vito/config"
	"github.com/factly/dega-vito/service"
	"github.com/factly/dega-vito/util"
	"github.com/go-chi/chi"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/spf13/viper"
)

// @title Dega Vito
// @version 1.0
// @description Dega Vito Service

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:7791
// @BasePath /
func main() {
	// setup environment vars
	config.SetupVars()

	// setup database
	config.SetupDB()

	// parse templates
	util.SetupTemplates()

	go func() {
		promRouter := chi.NewRouter()

		sqlDB, _ := config.DB.DB()
		collector := sqlstats.NewStatsCollector(viper.GetString("database_name"), sqlDB)

		prometheus.MustRegister(collector)

		promRouter.Mount("/metrics", promhttp.Handler())
		log.Fatal(http.ListenAndServe(":8001", promRouter))
	}()

	r := service.RegisterRoutes()
	if err := http.ListenAndServe(":8000", r); err != nil {
		log.Fatal(err)
	}
}
