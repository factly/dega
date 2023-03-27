package service

type paging struct {
	Total int64         `json:"total"`
	Nodes []interface{} `json:"nodes"`
}
