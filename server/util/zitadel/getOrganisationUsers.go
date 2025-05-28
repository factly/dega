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

type OrganisationUsersResponse struct {
	Result  []OrganisationUserResult `json:"result"`
	Details Details                  `json:"details"`
}

type OrganisationUserResult struct {
	ID            string `json:"userId"`
	Name          string `json:"name"`
	PrimaryDomain string `json:"primaryDomain"`
	Human         Human  `json:"human"`
}

type OrganisationUsers struct {
	Result []OrganisationUserResult `json:"result"`
	Total  int64                    `json:"total"`
}

type OrganisationUsersQuery struct {
}

func GetOrganisationUsers(token, orgID string, userIDs, userNames []string) (OrganisationUsers, error) {

	url := viper.GetString("zitadel_protocol") + "://" + config.GetZitadelDomain() + "/v2/users"
	method := "POST"

	payload := ZitadelQueryPayload{
		Query: Query{
			Offset: 0,
			Asc:    true,
		},
	}

	payload.Queries = make([]interface{}, 0)
	payload.Queries = append(payload.Queries, map[string]interface{}{
		"typeQuery": UserTypeQuery{
			Type: "TYPE_HUMAN",
		}})

	if len((userIDs)) != 0 {
		payload.Queries = append(payload.Queries, map[string]interface{}{
			"inUserIdsQuery": InUserIdsQuery{
				UserIds: userIDs,
			}})
	}

	if len((userNames)) != 0 {
		userNamesQuery := make([]map[string]interface{}, len(userNames))
		for i, userName := range userNames {
			userNamesQuery[i] = map[string]interface{}{
				"userNameQuery": map[string]interface{}{
					"UserName": userName,
				},
			}
		}
		payload.Queries = append(payload.Queries, map[string]interface{}{"orQuery": Queries{
			OrQuery: OrQuery{
				Queries: userNamesQuery,
			},
		}})
	}

	allOrgs := OrganisationUsers{}
	resp := OrganisationUsersResponse{}

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
	req.Header.Add("Authorization", "Bearer "+viper.GetString("ZITADEL_PERSONAL_ACCESS_TOKEN"))

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

	// covert string to int64
	if resp.Details.TotalResult == "" {
		return allOrgs, nil
	}

	total, err := strconv.ParseInt(resp.Details.TotalResult, 10, 64)
	if err != nil {
		return allOrgs, err
	}
	allOrgs.Result = resp.Result
	allOrgs.Total = int64(total)
	return allOrgs, nil
}
