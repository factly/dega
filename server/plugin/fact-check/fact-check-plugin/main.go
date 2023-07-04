package main

import (
	"fmt"
	"log"
	"net/url"

	"github.com/factly/dega-server/plugin/fact-check/fact-check-plugin/db"
	"github.com/factly/dega-server/plugin/fact-check/fact-check-plugin/handlers"
	"github.com/factly/dega-server/plugin/fact-check/fact-check-plugin/handlers/rating"
	"github.com/factly/dega-server/plugin/fact-check/shared"
	"github.com/hashicorp/go-plugin"
	"github.com/spf13/viper"
)

type FactcheckPluginImpl struct {
	requestHandlers map[string]shared.Handler
}

func (f *FactcheckPluginImpl) RegisterRoutes() error {
	viper.AddConfigPath(".")
	viper.SetConfigName("config")
	viper.SetEnvPrefix("dega")
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		log.Println("config file not found...")
	}

	log.Println("Setting up database")
	db.SetupDB()

	log.Println("Registering routes")

	f.requestHandlers = make(map[string]shared.Handler)
	f.requestHandlers["/hello"] = handlers.HandleHello
	f.requestHandlers["/ratings"] = rating.List

	return nil
}

func (f *FactcheckPluginImpl) HandleRequest(request shared.Request) (shared.Any, shared.Error) {
	urlString := request.URL
	urlStruct, err := url.Parse(urlString)
	if err != nil {
		return nil, shared.Error{Code: 500, Message: err.Error()}
	}
	log.Println("Handling request for", urlStruct.Path)

	if handler, ok := f.requestHandlers[urlStruct.Path]; !ok {
		return nil, shared.Error{Code: 500, Message: fmt.Sprintf("No handler found for %s", urlStruct.Path)}
	} else {
		resp, err := handler(request)
		if err != nil {
			return nil, *err
		}
		return resp, shared.Error{}
	}

}

func main() {
	plugin.Serve(&plugin.ServeConfig{
		HandshakeConfig: shared.Handshake,
		Plugins: map[string]plugin.Plugin{
			"factcheck": &shared.FactcheckPlugin{Impl: &FactcheckPluginImpl{}},
		},
	})
}
