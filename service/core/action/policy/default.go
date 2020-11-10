package policy

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// DataFile default json data file
var DataFile = "./data/policies.json"

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
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	oID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	jsonFile, err := os.Open(DataFile)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer jsonFile.Close()

	policies := make([]policyReq, 0)

	byteValue, _ := ioutil.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &policies)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	authors := author.Mapper(oID, uID)

	result := paging{}
	result.Nodes = make([]model.Policy, 0)

	for _, policy := range policies {
		res := Mapper(Composer(oID, sID, policy), authors)
		result.Nodes = append(result.Nodes, res)

		if err = insertIntoMeili(res); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	result.Total = len(result.Nodes)

	renderx.JSON(w, http.StatusCreated, result)
}
