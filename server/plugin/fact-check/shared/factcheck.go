package shared

import (
	"errors"
	"log"
	"net/rpc"
)

type FactcheckClient struct{ client *rpc.Client }

func (fc *FactcheckClient) RegisterRoutes() error {
	var resp interface{}
	return fc.client.Call("Plugin.RegisterRoutes", new(interface{}), &resp)
}

func (fc *FactcheckClient) HandleRequest(request Request) (Any, Error) {
	var resp Any
	err := fc.client.Call("Plugin.HandleRequest", request, &resp)
	if err != nil {
		return nil, Error{Message: err.Error(), Code: 500, Error: err}
	}

	return resp, Error{}
}

type FactcheckServer struct {
	Impl FactCheckService
}

func (fs *FactcheckServer) RegisterRoutes(args interface{}, resp *interface{}) error {
	return fs.Impl.RegisterRoutes()
}

func (fs *FactcheckServer) HandleRequest(request Request, resp *Any) error {
	result, err := fs.Impl.HandleRequest(request)
	log.Println("FactcheckServer.HandleRequest", result, err)
	if err.Code != 0 {
		return errors.New(err.Message)
	}
	*resp = result
	return nil
}
