package search

import (
	"encoding/json"
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
	Service shared.SearchService
}

func GetSearchSingleton() (*SearchSingleton, error) {
	if singletonInstance == nil {
		lock.Lock()
		defer lock.Unlock()

		client, searchService, err := LoadSearchPlugin("meilisearch")
		if err != nil {
			return nil, err
		}
		singletonInstance = &SearchSingleton{
			Client:  client,
			Service: searchService,
		}
	}
	return singletonInstance, nil
}

func LoadSearchPlugin(pluginIdentifier string) (*plugin.Client, shared.SearchService, error) {
	client := plugin.NewClient(&plugin.ClientConfig{
		HandshakeConfig: shared.Handshake,
		Plugins:         shared.PluginMap,
		Cmd:             exec.Command("sh", "-c", viper.GetString("search_plugin_path")),
		AllowedProtocols: []plugin.Protocol{
			plugin.ProtocolNetRPC,
		},
	})

	rpcClient, err := client.Client()
	if err != nil {
		return nil, nil, err
	}

	raw, err := rpcClient.Dispense(pluginIdentifier)
	if err != nil {
		return nil, nil, err
	}

	searchService := raw.(shared.SearchService)

	return client, searchService, nil
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
