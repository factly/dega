package factcheck

import (
	"os/exec"

	"github.com/factly/dega-server/plugin/fact-check/shared"
	"github.com/hashicorp/go-plugin"
	"github.com/spf13/viper"
)

func GetFactcheckPlugin() (shared.FactCheckService, error) {
	client := plugin.NewClient(&plugin.ClientConfig{
		HandshakeConfig: shared.Handshake,
		Plugins:         shared.PluginMap,
		Cmd:             exec.Command("sh", "-c", viper.GetString("fact_check_plugin_path")),
		AllowedProtocols: []plugin.Protocol{
			plugin.ProtocolNetRPC,
		},
	})

	rpcClient, err := client.Client()
	if err != nil {
		return nil, err
	}

	raw, err := rpcClient.Dispense("factcheck")
	if err != nil {
		return nil, err
	}

	factcheckService := raw.(shared.FactCheckService)
	factcheckService.RegisterRoutes()

	return factcheckService, nil
}
