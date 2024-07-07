package zitadel

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

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

func GetOrganisations(token string) []Result {
	// to get organisations in project of a user only if there are any authorizations/grants in an organisation
	url := viper.GetString("zitadel_protocol") + "://" + viper.GetString("zitadel_domain") + "/auth/v1/global/projectorgs/_search"
	method := "POST"

	payload := ZitadelQueryPayload{
		Query: Query{
			Offset: 0,
			Asc:    true,
		},
	}

	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(payload)

	client := &http.Client{}
	req, err := http.NewRequest(method, url, buf)

	if err != nil {
		loggerx.Error(err)
		return []Result{}
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+getBearerToken(token))

	res, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		return []Result{}
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return []Result{}
	}

	allOrgs := Organisations{}

	err = json.Unmarshal(body, &allOrgs)
	if err != nil {
		loggerx.Error(err)
		return []Result{}
	}

	fmt.Println(string(body))

	return allOrgs.Result
}

func getBearerToken(header string) string {
	splitToken := strings.Split(header, "Bearer ")
	if len(splitToken) == 2 {
		return splitToken[1]
	} else {
		return ""
	}
}
