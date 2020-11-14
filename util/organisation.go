package util

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/factly/dega-server/service/core/model"
	"github.com/spf13/viper"
)

type paging struct {
	Nodes []model.Organisation `json:"nodes"`
	Total int64                `json:"total"`
}

// GetAllOrganisationsMap return slice of all organisations
func GetAllOrganisationsMap(q string) (map[uint]model.Organisation, error) {

	path := "/organisations"
	if q != "" {
		path = fmt.Sprint(path, "?q=", q)
	}

	req, err := http.NewRequest("GET", viper.GetString("kavach_url")+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	var pagingList paging

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("could not fetch organisations")
	}

	err = json.NewDecoder(resp.Body).Decode(&pagingList)
	if err != nil {
		return nil, err
	}

	orgMap := make(map[uint]model.Organisation)

	for _, organisation := range pagingList.Nodes {
		orgMap[organisation.ID] = organisation
	}
	return orgMap, nil
}
