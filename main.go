package main

import (
	"log"
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/factly/dega-server/config"
	_ "github.com/factly/dega-server/docs" // docs is generated by Swag CLI, you have to import it.
	"github.com/factly/dega-server/service"
	coreModel "github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/x/meilisearchx"
	"github.com/go-chi/chi"
)

// @title Dega API
// @version 1.0
// @description Dega server API

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:7789
// @BasePath /
func main() {
	config.SetupVars()

	// db setup
	config.SetupDB()

	factCheckModel.Migration()
	coreModel.Migration()

	err := config.CreateSuperOrganisation()
	if err != nil {
		log.Println(err)
	}

	meilisearchx.SetupMeiliSearch("dega", []string{"name", "slug", "description", "title", "subtitle", "excerpt", "site_title", "site_address", "tag_line", "review", "review_tag_line"})

	r := service.RegisterRoutes()

	go func() {
		promRouter := chi.NewRouter()
		promRouter.Mount("/metrics", promhttp.Handler())
		log.Fatal(http.ListenAndServe(":8001", promRouter))
	}()

	if err = http.ListenAndServe(":8000", r); err != nil {
		log.Fatal(err)
	}

}
