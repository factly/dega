package shared

import (
	"fmt"
	"net/rpc"
)

type SearchClient struct{ client *rpc.Client }

func (m *SearchClient) Connect(config *SearchConfig) error {
	var resp interface{}
	return m.client.Call("Plugin.Connect", config, &resp)
}

func (m *SearchClient) Add(data map[string]interface{}) error {
	var resp interface{}
	return m.client.Call("Plugin.Add", data, &resp)
}

func (m *SearchClient) BatchAdd(data []map[string]interface{}) error {
	var resp interface{}
	return m.client.Call("Plugin.BatchAdd", data, &resp)
}

func (m *SearchClient) Delete(kind string, id uint) error {
	var resp interface{}
	return m.client.Call("Plugin.Delete", map[string]interface{}{
		"kind": kind,
		"id":   id,
	}, &resp)
}

func (m *SearchClient) Update(data map[string]interface{}) error {
	var resp interface{}
	return m.client.Call("Plugin.Update", data, &resp)
}

func (m *SearchClient) BatchUpdate(data []map[string]interface{}) error {
	var resp interface{}
	return m.client.Call("Plugin.BatchUpdate", data, &resp)
}

func (m *SearchClient) SearchQuery(q, filters, kind string, limit, offset int) (SearchResponse, error) {
	var resp SearchResponse
	err := m.client.Call("Plugin.SearchQuery", map[string]interface{}{
		"q":       q,
		"filters": filters,
		"kind":    kind,
		"limit":   limit,
		"offset":  offset,
	}, &resp)
	if err != nil {
		return SearchResponse{}, err
	}

	return resp, nil
}

func (m *SearchClient) DeleteAllDocuments() error {
	var resp interface{}
	return m.client.Call("Plugin.DeleteAllDocuments", new(interface{}), &resp)
}

func (m *SearchClient) BatchDelete(objectIDs []string) error {
	var resp interface{}
	return m.client.Call("Plugin.BatchDelete", objectIDs, &resp)
}

func (m *SearchClient) GetAllDocumentsBySpace(space uint) (SearchResponse, error) {
	var resp SearchResponse
	err := m.client.Call("Plugin.GetAllDocumentsBySpace", space, &resp)
	if err != nil {
		return SearchResponse{}, err
	}

	return resp, nil
}

type SearchServer struct {
	Impl SearchService
}

func (m *SearchServer) Connect(config *SearchConfig, reply *interface{}) error {
	return m.Impl.Connect(config)
}

func (m *SearchServer) Add(data map[string]interface{}, reply *interface{}) error {
	return m.Impl.Add(data)
}

func (m *SearchServer) BatchAdd(data []map[string]interface{}, reply *interface{}) error {
	return m.Impl.BatchAdd(data)
}

func (m *SearchServer) Delete(data map[string]interface{}, reply *interface{}) error {
	kind, ok := data["kind"].(string)
	if !ok {
		return fmt.Errorf("kind is not a string")
	}

	id, ok := data["id"].(uint)
	if !ok {
		return fmt.Errorf("id is not a uint")
	}

	return m.Impl.Delete(kind, id)
}

func (m *SearchServer) Update(data map[string]interface{}, reply *interface{}) error {
	return m.Impl.Update(data)
}

func (m *SearchServer) BatchUpdate(data []map[string]interface{}, reply *interface{}) error {
	return m.Impl.BatchUpdate(data)
}

func (m *SearchServer) SearchQuery(data map[string]interface{}, reply *SearchResponse) error {
	q, ok := data["q"].(string)
	if !ok {
		return fmt.Errorf("q is not a string")
	}

	filters, ok := data["filters"].(string)
	if !ok {
		return fmt.Errorf("filters is not a string")
	}

	kind, ok := data["kind"].(string)
	if !ok {
		return fmt.Errorf("kind is not a string")
	}

	limit, ok := data["limit"].(int)
	if !ok {
		return fmt.Errorf("limit is not a int")
	}

	offset, ok := data["offset"].(int)
	if !ok {
		return fmt.Errorf("offset is not a int")
	}

	result, err := m.Impl.SearchQuery(q, filters, kind, limit, offset)
	if err != nil {
		return err
	}

	*reply = result
	return nil
}

func (m *SearchServer) DeleteAllDocuments(data interface{}, reply *interface{}) error {
	return m.Impl.DeleteAllDocuments()
}

func (m *SearchServer) BatchDelete(objectIDs []string, reply *interface{}) error {
	return m.Impl.BatchDelete(objectIDs)
}

func (m *SearchServer) GetAllDocumentsBySpace(space uint, reply *SearchResponse) error {
	result, err := m.Impl.GetAllDocumentsBySpace(space)
	if err != nil {
		return err
	}

	*reply = result
	return nil
}
