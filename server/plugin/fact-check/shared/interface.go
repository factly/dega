package shared

import (
	"net/http"
	"net/rpc"

	"github.com/hashicorp/go-plugin"
)

var Handshake = plugin.HandshakeConfig{
	ProtocolVersion:  1,
	MagicCookieKey:   "FACT_CHECK_PLUGIN",
	MagicCookieValue: "factcheck_plugin",
}

var PluginMap = map[string]plugin.Plugin{
	"factcheck": &FactcheckPlugin{},
}

type Handler func(request Request) (interface{}, error)

type Request struct {
	Body       interface{} `json:"body"`
	Header     http.Header `json:"header"`
	Host       string      `json:"host"`
	Proto      string      `json:"proto"`
	Method     string      `json:"method"`
	RemoteAddr string      `json:"remote_addr"`
	RequestURI string      `json:"request_uri"`
	URL        string      `json:"url"`
}

type FactCheckService interface {
	RegisterRoutes() error
	HandleRequest(Request) (interface{}, error)
}

type FactcheckPlugin struct {
	Impl FactCheckService
}

func (p FactcheckPlugin) Server(*plugin.MuxBroker) (interface{}, error) {
	return &FactcheckServer{Impl: p.Impl}, nil
}

func (*FactcheckPlugin) Client(b *plugin.MuxBroker, c *rpc.Client) (interface{}, error) {
	return &FactcheckClient{client: c}, nil
}
