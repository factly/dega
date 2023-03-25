package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/factly/custom-search/actions"
	"github.com/factly/custom-search/config"
	"github.com/spf13/viper"
)

func init() {
	config.SetupVars()
}

func main() {
	r := actions.RegisterRoutes()
	if err := http.ListenAndServe(fmt.Sprintf(":%d", viper.GetInt32("port")), r); err != nil {
		log.Fatal(err)
	}
	log.Println("server successfully running on port " + fmt.Sprintln(viper.GetInt32("port")))
}
