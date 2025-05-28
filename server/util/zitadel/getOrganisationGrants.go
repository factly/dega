package zitadel

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

type OrganisationGrantsResponse struct {
	Result  []OrganisationGrant `json:"result"`
	Details Details             `json:"details"`
}

type Details struct {
	TotalResult string `json:"totalResult"`
}

type OrganisationGrant struct {
	UserID      string   `json:"userId"`
	DisplayName string   `json:"displayName"`
	FirstName   string   `json:"firstName"`
	LastName    string   `json:"lastName"`
	Email       string   `json:"email"`
	RoleKeys    []string `json:"roleKeys"`
}

type OrganisationGrants struct {
	Result []OrganisationGrant `json:"result"`
	Total  int64               `json:"total"`
}

func GetOrganisationGrants(token, orgID string) (OrganisationGrants, error) {
	url := viper.GetString("zitadel_protocol") + "://" + config.GetZitadelDomain() + "/management/v1/users/grants/_search"
	method := "POST"

	payload := ZitadelQueryPayload{
		Query: Query{
			Offset: 0,
			Asc:    true,
		},
	}
	payload.Queries = make([]interface{}, 0)

	payload.Queries = append(payload.Queries, map[string]interface{}{
		"userTypeQuery": UserTypeQuery{
			Type: "TYPE_HUMAN",
		}})

	allOrgs := OrganisationGrants{}
	resp := OrganisationGrantsResponse{}

	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(payload)

	client := &http.Client{}
	req, err := http.NewRequest(method, url, buf)

	if err != nil {
		loggerx.Error(err)
		return allOrgs, err
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Accept", "application/json")
	if token != "" {
		req.Header.Add("Authorization", "Bearer "+getBearerToken(token))
	} else {
		req.Header.Add("Authorization", "Bearer "+getBearerToken(viper.GetString("ZITADEL_PERSONAL_ACCESS_TOKEN")))
	}

	req.Header.Add("x-zitadel-orgid", orgID)

	res, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		return allOrgs, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return allOrgs, err
	}

	err = json.Unmarshal(body, &resp)
	if err != nil {
		loggerx.Error(err)
		return allOrgs, err
	}

	allOrgs.Result = resp.Result

	// covert string to int64
	if resp.Details.TotalResult == "" {
		return allOrgs, nil
	}

	total, err := strconv.ParseInt(resp.Details.TotalResult, 10, 64)
	if err != nil {
		return allOrgs, err
	}
	allOrgs.Total = int64(total)

	return allOrgs, nil
}
