package util

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

type OrganisationUsers struct {
	Result []OrganisationUserResult `json:"result"`
}

type OrganisationUserResult struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	PrimaryDomain string `json:"primaryDomain"`
	Human         Human  `json:"human"`
}

type Query struct {
	Offset int  `json:"offset"`
	Asc    bool `json:"asc"`
}

type ZitadelQueryPayload struct {
	Query   Query     `json:"query"`
	Queries []Queries `json:"queries"`
}

type Result struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	PrimaryDomain string `json:"primaryDomain"`
}

type Organisations struct {
	Result []Result `json:"result"`
}

type Queries struct {
	InUserIdsQuery InUserIdsQuery `json:"inUserIdsQuery"`
}

type InUserIdsQuery struct {
	UserIds []string `json:"userIds"`
}

type Human struct {
	Profile Profile `json:"profile"`
	Email   Email   `json:"email"`
}

type Profile struct {
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	DisplayName string `json:"displayName"`
}

type Email struct {
	Email string `json:"email"`
}

func GetSpaceMembers(userIDs []string) ([]OrganisationUserResult, error) {

	url := viper.GetString("zitadel_protocol") + "://" + viper.GetString("zitadel_domain") + "/management/v1/users/_search"
	method := "POST"

	payload := ZitadelQueryPayload{
		Query: Query{
			Offset: 0,
			Asc:    true,
		},
	}

	if len((userIDs)) != 0 {
		payload.Queries = []Queries{
			{
				InUserIdsQuery: InUserIdsQuery{
					UserIds: userIDs,
				},
			},
		}
	}

	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(payload)

	client := &http.Client{}
	req, err := http.NewRequest(method, url, buf)

	if err != nil {
		loggerx.Error(err)
		return []OrganisationUserResult{}, err
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+viper.GetString("zitadel_personal_access_token"))

	res, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		return []OrganisationUserResult{}, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return []OrganisationUserResult{}, err
	}

	allOrgs := OrganisationUsers{}

	err = json.Unmarshal(body, &allOrgs)
	if err != nil {
		loggerx.Error(err)
		return []OrganisationUserResult{}, err
	}

	return allOrgs.Result, nil
}
