package search

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"os"
	"os/exec"
	"sync"

	"github.com/factly/dega-server/plugin/search/shared"
	"github.com/hashicorp/go-plugin"
	"github.com/spf13/viper"
)

var singletonInstance *SearchSingleton
var lock = &sync.Mutex{}

type SearchSingleton struct {
	Client  *plugin.Client
	Service map[string]shared.SearchService
}

func (s SearchSingleton) GetSearchPlugin(pluginIndentifier string) (shared.SearchService, error) {
	if _, ok := s.Service[pluginIndentifier]; !ok {
		return nil, errors.New("plugin not supported")
	}
	return s.Service[pluginIndentifier], nil
}

func GetSearchSingleton() (*SearchSingleton, error) {
	if singletonInstance == nil {
		lock.Lock()
		defer lock.Unlock()

		client := LoadSearchPluginClient()

		rpcClient, err := client.Client()
		if err != nil {
			return nil, err
		}

		serviceMap := map[string]shared.SearchService{}
		// for each plugin, we need to get the service
		for key := range shared.PluginMap {
			raw, err := rpcClient.Dispense(key)
			if err != nil {
				return nil, err
			}

			searchService := raw.(shared.SearchService)

			serviceMap[key] = searchService
		}

		singletonInstance = &SearchSingleton{
			Client:  client,
			Service: serviceMap,
		}
	}
	return singletonInstance, nil
}

func LoadSearchPluginClient() *plugin.Client {
	client := plugin.NewClient(&plugin.ClientConfig{
		HandshakeConfig: shared.Handshake,
		Plugins:         shared.PluginMap,
		Cmd:             exec.Command("sh", "-c", viper.GetString("search_plugin_path")),
		AllowedProtocols: []plugin.Protocol{
			plugin.ProtocolNetRPC,
		},
	})

	return client

	// rpcClient, err := client.Client()
	// if err != nil {
	// 	return nil, err
	// }

	// return rpcClient, nil

	// raw, err := rpcClient.Dispense(pluginIdentifier)
	// if err != nil {
	// 	return nil, nil, err
	// }

	// searchService := raw.(shared.SearchService)

	// return client, searchService, nil
}

func GetSearchServiceConfig() (*shared.SearchConfig, error) {
	config := new(shared.SearchConfig)
	jsonFile, err := os.Open("./data/search-config.json")
	if err != nil {
		return nil, err
	}
	defer jsonFile.Close()
	fileBuffer, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(fileBuffer, config)
	if err != nil {
		return nil, err
	}

	return config, nil
}
