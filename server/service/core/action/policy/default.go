package policy

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	httpx "github.com/factly/dega-server/util/http"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/spf13/viper"
)

// PolicyDataFile default json data file
var PolicyDataFile = "./data/policies.json"
var RolesDataFile = "./data/roles.json"

// createDefaults - Create Default Policies
// @Summary Create Default Policies
// @Description Create Default Policies
// @Tags Policy
// @ID add-default-policies
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 201 {object} paging
// @Failure 400 {array} string
// @Router /core/policies/default [post]
func createDefaults(w http.ResponseWriter, r *http.Request) {
	// uID, err := util.GetUser(r.Context())
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
	// 	return
	// }

	// sID, err := middlewarex.GetSpace(r.Context())
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
	// 	return
	// }

	// oID, err := util.GetOrganisation(r.Context())
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
	// 	return
	// }

	policyJsonFile, err := os.Open(PolicyDataFile)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	defer policyJsonFile.Close()
	policies := make([]policyReq, 0)
	byteValue, err := ioutil.ReadAll(policyJsonFile)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	err = json.Unmarshal(byteValue, &policies)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	rolesJsonFile, err := os.Open(RolesDataFile)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	defer rolesJsonFile.Close()
	roles := make([]roleReq, 0)
	byteValue, err = ioutil.ReadAll(rolesJsonFile)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	err = json.Unmarshal(byteValue, &roles)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defaultPolicies := make([]model.KavachPolicy, 0)
	// for index, role := range roles {
	// policy, err := createRoleandPolicyonKavach(role, policies[index], uint(oID), uint(sID), uint(uID))
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
	// 	return
	// }

	// defaultPolicies = append(defaultPolicies, *policy)
	// }
	renderx.JSON(w, http.StatusCreated, defaultPolicies)
}

func createRoleandPolicyonKavach(role roleReq, policy policyReq, orgID, spaceID, userID uint) (*model.KavachPolicy, error) {
	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&role)
	if err != nil {
		return nil, err
	}

	applicationID, err := util.GetApplicationID(uint(userID), "dega")
	if err != nil {
		return nil, err
	}

	client := httpx.CustomHttpClient()
	req, err := http.NewRequest(http.MethodPost, viper.GetString("kavach_url")+"/organisations/"+fmt.Sprintf("%d", orgID)+"/applications/"+fmt.Sprintf("%d", applicationID)+"/spaces/"+fmt.Sprintf("%d", spaceID)+"/roles", buf)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-User", fmt.Sprintf("%d", userID))
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return nil, errors.New("could not create role in the space")
	}

	spaceRole := model.SpaceRole{}
	err = json.NewDecoder(resp.Body).Decode(&spaceRole)
	if err != nil {
		return nil, errors.New("unable to decode default space role response body")
	}
	policyReqBody := map[string]interface{}{
		"name":        policy.Name,
		"description": policy.Description,
		"slug":        slugx.Make(policy.Name),
		"permissions": policy.Permissions,
		"roles":       append([]int{}, int(spaceRole.ID)),
	}

	err = json.NewEncoder(buf).Encode(&policyReqBody)
	if err != nil {
		return nil, err
	}

	req, err = http.NewRequest(http.MethodPost, viper.GetString("kavach_url")+"/organisations/"+fmt.Sprintf("%d", orgID)+"/applications/"+fmt.Sprintf("%d", applicationID)+"/spaces/"+fmt.Sprintf("%d", spaceID)+"/policy", buf)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-User", fmt.Sprintf("%d", userID))
	resp, err = client.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		return nil, errors.New("error in creating policy on kavach")
	}

	spacePolicy := &model.KavachPolicy{}
	err = json.NewDecoder(resp.Body).Decode(spacePolicy)
	if err != nil {
		return nil, errors.New("unable to decode default space policy response body")
	}

	return spacePolicy, nil
}
