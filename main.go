package main

import (
	"log"
	"net/http"

	"github.com/factly/dega-templates/config"
	"github.com/factly/dega-templates/service"
	"github.com/factly/dega-templates/util"
)

// @title Dega Templates
// @version 1.0
// @description Dega Templates Service

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

	r := service.RegisterRoutes()
	if err := http.ListenAndServe(":8000", r); err != nil {
		log.Fatal(err)
	}
}
