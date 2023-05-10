package main

import (
	"fmt"
	"log"
	"net/url"

	"github.com/factly/dega-server/plugin/fact-check/fact-check-plugin/handlers"
	"github.com/factly/dega-server/plugin/fact-check/shared"
	"github.com/hashicorp/go-plugin"
)

type FactcheckPluginImpl struct {
	requestHandlers map[string]shared.Handler
}

func (f *FactcheckPluginImpl) RegisterRoutes() error {
	log.Println("Registering routes")

	f.requestHandlers = make(map[string]shared.Handler)
	f.requestHandlers["/hello"] = handlers.HandleHello

	return nil
}

func (f *FactcheckPluginImpl) HandleRequest(request shared.Request) (interface{}, error) {
	urlString := request.URL
	urlStruct, err := url.Parse(urlString)
	if err != nil {
		return nil, err
	}
	log.Println("Handling request for", urlStruct.Path)

	if handler, ok := f.requestHandlers[urlStruct.Path]; !ok {
		return nil, fmt.Errorf("no handler registered for route %s", urlStruct.Path)
	} else {
		return handler(request)
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
