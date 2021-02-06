package policy

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
	"github.com/spf13/viper"
)

type paging struct {
	Total int            `json:"total"`
	Nodes []model.Policy `json:"nodes"`
}

// list - Get all policies
// @Summary Get all policies
// @Description Get all policies
// @Tags Policy
// @ID get-all-policy
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {object} paging
// @Router /core/policies [get]
func list(w http.ResponseWriter, r *http.Request) {
	userID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	spaceID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	organisationID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	req, err := http.NewRequest("GET", viper.GetString("keto_url")+"/engines/acp/ory/regex/policies", nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	defer resp.Body.Close()

	var polices []model.KetoPolicy

	err = json.NewDecoder(resp.Body).Decode(&polices)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	prefixName := fmt.Sprint("id:org:", organisationID, ":app:dega:space:", spaceID, ":")
	var onlyOrgPolicy []model.KetoPolicy

	for _, each := range polices {
		if strings.HasPrefix(each.ID, prefixName) {
			onlyOrgPolicy = append(onlyOrgPolicy, each)
		}
	}

	for i, j := 0, len(onlyOrgPolicy)-1; i < j; i, j = i+1, j-1 {
		onlyOrgPolicy[i], onlyOrgPolicy[j] = onlyOrgPolicy[j], onlyOrgPolicy[i]
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	total := len(onlyOrgPolicy)
	lowerLimit := offset
	upperLimit := offset + limit
	if offset > total {
		lowerLimit = 0
		upperLimit = 0
	} else if offset+limit > total {
		lowerLimit = offset
		upperLimit = total
	}

	onlyOrgPolicy = onlyOrgPolicy[lowerLimit:upperLimit]

	/* User req */
	userMap := author.Mapper(organisationID, userID)

	pagePolicies := make([]model.Policy, 0)

	for _, each := range onlyOrgPolicy {
		pagePolicies = append(pagePolicies, Mapper(each, userMap))
	}

	var result paging
	result.Nodes = pagePolicies
	result.Total = total
	renderx.JSON(w, http.StatusOK, result)
}
