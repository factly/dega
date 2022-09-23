package util

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/factly/dega-server/service/core/model"
	httpx "github.com/factly/dega-server/util/http"
	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

type RelationTuplesWithSubjectID struct {
	Tuples []TupleWithSubjectID `json:"relation_tuples"`
}

type RelationTuplesWithSubjectSet struct {
	Tuples []TupleWithSubjectSet `json:"relation_tuples"`
}

type SubjectSet struct {
	Namespace string `json:"namespace"`
	Object    string `json:"object"`
	Relation  string `json:"relation"`
}
type TupleWithSubjectID struct {
	SubjectSet
	SubjectID string `json:"subject_id"`
}

type TupleWithSubjectSet struct {
	SubjectSet
	TuplesSubjectSet SubjectSet `json:"subject_set"`
}

const namespace string = "spaces"

func GetPermissions(orgID, appID, spaceID, uID uint) ([]model.Permission, error) {
	client := httpx.CustomHttpClient()
	roleObject := fmt.Sprintf("roles:org:%d:app:%d:space:%d", orgID, appID, spaceID)
	requestURL := viper.GetString("keto_read_api_url") + "/relation-tuples?namespace=spaces&" + fmt.Sprintf("subject_id=%d&object=%s", uID, roleObject)
	req, err := http.NewRequest("GET", requestURL, nil)
	if err != nil {
		return nil, err
	}

	response, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	if response.StatusCode != 200 {
		return nil, err
	}

	tuples := RelationTuplesWithSubjectID{}
	err = json.NewDecoder(response.Body).Decode(&tuples)
	if err != nil {
		return nil, err
	}
	var permissions []model.Permission
	var ketoResponse = make(map[string][]string)
	for _, tuple := range tuples.Tuples {
		if strings.HasPrefix(tuple.Object, "roles") {
			baseURL, err := url.Parse(viper.GetString("keto_read_api_url"))
			if err != nil {
				return nil, err
			}

			//adding the path
			baseURL.Path += "relation-tuples"
			params := url.Values{}
			params.Add("namespace", namespace)
			params.Add("subject_set.namespace", namespace)
			params.Add("subject_set.object", roleObject)
			params.Add("subject_set.relation", tuple.Relation)
			baseURL.RawQuery = params.Encode()
			reqUrl := baseURL.String()
			req, err = http.NewRequest("GET", reqUrl, nil)
			if err != nil {
				return nil, err
			}
			response, err = client.Do(req)
			if err != nil {
				return nil, err
			}

			if response.StatusCode != 200 {
				continue
			}

			resourceTuples := RelationTuplesWithSubjectSet{}
			err = json.NewDecoder(response.Body).Decode(&resourceTuples)
			if err != nil {
				return nil, err
			}

			for _, resourceTuple := range resourceTuples.Tuples {
				splittedObject := strings.Split(resourceTuple.Object, ":")
				var entity string
				if len(splittedObject) > 0 {
					entity = splittedObject[len(splittedObject)-1]
				}
				actions, ok := ketoResponse[entity]
				if ok {
					if !contains(actions, resourceTuple.Relation) {
						ketoResponse[entity] = append(actions, resourceTuple.Relation)
					}
				} else {
					ketoResponse[entity] = append([]string{}, resourceTuple.Relation)
				}
			}
		}
	}

	_, err = json.Marshal(ketoResponse)
	if err != nil {
		loggerx.Error(err)
		return nil, err
	}

	for resource, action := range ketoResponse {
		var permission model.Permission
		permission.Resource = resource
		permission.Actions = action
		permissions = append(permissions, permission)
	}

	return permissions, nil
}

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
