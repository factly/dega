package service

// list response
type googleClaimsPaging struct {
	Total    int           `json:"total"`
	Nodes    []interface{} `json:"nodes"`
	NextPage string        `json:"nextPage"`
}

type IgoogleService interface {
	List(factChecks map[string]interface{}) googleClaimsPaging
}

type googleService struct{}

// List implements IgoogleService
func (googleService) List(factChecks map[string]interface{}) googleClaimsPaging {
	result := googleClaimsPaging{}
	result.Nodes = make([]interface{}, 0)

	if claims, found := factChecks["claims"]; found {
		result.Nodes = (claims).([]interface{})
		result.Total = len(result.Nodes)
	}

	if nextPageToken, found := factChecks["nextPageToken"]; found {
		result.NextPage = nextPageToken.(string)
	}

	return result
}

func GetGoogleService() IgoogleService {
	return googleService{}
}
