package policy

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

type paging struct {
	Total int            `json:"total"`
	Nodes []model.Policy `json:"nodes"`
}

func list(w http.ResponseWriter, r *http.Request) {
	req, err := http.NewRequest("GET", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies", nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()

	var polices []model.KetoPolicy

	json.NewDecoder(resp.Body).Decode(&polices)

	uID, err := util.GetUser(r.Context())

	if err != nil {
		return
	}

	sID, err := util.GetSpace(r.Context())

	if err != nil {
		return
	}

	space := &model.Space{}
	space.ID = uint(sID)

	err = config.DB.First(&space).Error

	if err != nil {
		return
	}

	prefixName := "id:org:" + strconv.Itoa(space.OrganisationID) + ":app:dega:space:" + strconv.Itoa(sID) + ":"
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
	userMap := author.Mapper(strconv.Itoa(space.OrganisationID), strconv.Itoa(uID))

	pagePolicies := make([]model.Policy, 0)

	for _, each := range onlyOrgPolicy {
		pagePolicies = append(pagePolicies, Mapper(each, userMap))
	}

	var result paging
	result.Nodes = pagePolicies
	result.Total = total
	renderx.JSON(w, http.StatusOK, result)
}
