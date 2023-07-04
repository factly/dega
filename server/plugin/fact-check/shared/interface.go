package shared

import (
	"encoding/gob"
	"net/http"
	"net/rpc"

	"github.com/factly/dega-server/plugin/fact-check/shared/model"
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

type Handler func(request Request) (Any, *Error)

type Request struct {
	Body       Any         `json:"body"`
	Header     http.Header `json:"header"`
	Host       string      `json:"host"`
	Proto      string      `json:"proto"`
	Method     string      `json:"method"`
	RemoteAddr string      `json:"remote_addr"`
	RequestURI string      `json:"request_uri"`
	URL        string      `json:"url"`
	Space      int         `json:"space"`
}

type Error struct {
	Message string `json:"message"`
	Code    int    `json:"code"`
	Error   error  `json:"error"`
}

type FactCheckService interface {
	RegisterRoutes() error
	HandleRequest(Request) (Any, Error)
}

type Any interface{}

type FactcheckPlugin struct {
	Impl FactCheckService
}

func (p FactcheckPlugin) Server(*plugin.MuxBroker) (interface{}, error) {
	// Register types
	gob.Register(model.RatingPaging{})

	return &FactcheckServer{Impl: p.Impl}, nil
}

func (*FactcheckPlugin) Client(b *plugin.MuxBroker, c *rpc.Client) (interface{}, error) {
	// Register types
	gob.Register(model.RatingPaging{})

	return &FactcheckClient{client: c}, nil
}
