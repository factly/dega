package shared

import (
	"net/rpc"
)

type FactcheckClient struct{ client *rpc.Client }

func (fc *FactcheckClient) RegisterRoutes() error {
	var resp interface{}
	return fc.client.Call("Plugin.RegisterRoutes", new(interface{}), &resp)
}

func (fc *FactcheckClient) HandleRequest(request Request) (interface{}, error) {
	var resp interface{}
	err := fc.client.Call("Plugin.HandleRequest", request, &resp)
	if err != nil {
		return nil, err
	}

	return resp, nil
}

type FactcheckServer struct {
	Impl FactCheckService
}

func (fs *FactcheckServer) RegisterRoutes(args interface{}, resp *interface{}) error {
	return fs.Impl.RegisterRoutes()
}

func (fs *FactcheckServer) HandleRequest(request Request, resp *interface{}) error {
	result, err := fs.Impl.HandleRequest(request)
	if err != nil {
		return err
	}
	*resp = result
	return nil
}
