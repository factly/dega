package shared

import (
	"net/rpc"
	"time"

	"github.com/hashicorp/go-plugin"
)

var Handshake = plugin.HandshakeConfig{
	ProtocolVersion:  1,
	MagicCookieKey:   "MEILI_SEARCH_PLUGIN",
	MagicCookieValue: "meilisearch",
}

type SearchConfig struct {
	Name      string              `json:"name,omitempty"`
	Host      string              `json:"host,omitempty"`
	APIkeys   map[string]string   `json:"api_keys"`
	Timeout   time.Duration       `json:"timeout,omitempty"`
	IndexName string              `json:"index_name"`
	Settings  map[string][]string `json:"settings"`
}

type SearchResponse struct {
	Hits             []map[string]interface{} `json:"hits,omitempty"`
	Limit            int64                    `json:"limit,omitempty"`
	Offset           int64                    `json:"offset,omitempty"`
	ProcessingTimeMs int64                    `json:"processing_time_ms,omitempty"`
	TotalHits        int64                    `json:"total_hits,omitempty"`
}

var PluginMap = map[string]plugin.Plugin{
	"meilisearch": &SearchPlugin{},
}

type SearchService interface {
	Connect(config *SearchConfig) error
	Add(data map[string]interface{}) error
	BatchAdd(data []map[string]interface{}) error
	Delete(kind string, id uint) error
	Update(data map[string]interface{}) error
	BatchUpdate(data []map[string]interface{}) error
	SearchQuery(q, filters, kind string, limit, offset int) (SearchResponse, error)
	DeleteAllDocuments() error
	BatchDelete(objectIDs []string) error
	GetAllDocumentsBySpace(space uint) (SearchResponse, error)
}

type SearchPlugin struct {
	Impl SearchService
}

func (p *SearchPlugin) Server(*plugin.MuxBroker) (interface{}, error) {
	return &SearchServer{Impl: p.Impl}, nil
}

func (*SearchPlugin) Client(b *plugin.MuxBroker, c *rpc.Client) (interface{}, error) {
	return &SearchClient{client: c}, nil
}
