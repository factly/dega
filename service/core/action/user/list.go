package user

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/factly/dega-server/service/core/action/author"

	"github.com/factly/dega-server/util/arrays"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int            `json:"total"`
	Nodes []model.Author `json:"nodes"`
}

// list - Get users with space access
// @Summary Get users with space access
// @Description Get users with space access
// @Tags Users
// @ID get-space-users
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {object} paging
// @Router /core/users [get]
func list(w http.ResponseWriter, r *http.Request) {
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

	userIDs := make([]uint, 0)

	// get all the admins of the organisation
	adminRoleID := fmt.Sprint("roles:org:", oID, ":admin")

	resp, err := util.KetoGetRequest("/engines/acp/ory/regex/roles/" + adminRoleID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	defer resp.Body.Close()

	adminRole := model.KetoRole{}
	err = json.NewDecoder(resp.Body).Decode(&adminRole)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	for _, member := range adminRole.Members {
		memid, _ := strconv.Atoi(member)
		userIDs = append(userIDs, uint(memid))
	}

	// get all the polices for organisation
	resp, err = util.KetoGetRequest("/engines/acp/ory/regex/policies")
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}
	defer resp.Body.Close()

	var policyList []model.KetoPolicy
	err = json.NewDecoder(resp.Body).Decode(&policyList)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	prefixName := fmt.Sprint("id:org:", oID, ":app:dega:space:", sID, ":")

	// append subjects whose id has prefix for our space
	for _, policy := range policyList {
		if strings.HasPrefix(policy.ID, prefixName) {
			for _, subject := range policy.Subjects {
				subid, _ := strconv.Atoi(subject)
				userIDs = append(userIDs, uint(subid))
			}
		}
	}

	userSet := arrays.RemoveDuplicate(userIDs)

	// Fetch all the users
	userMap, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	userlist := make([]model.Author, 0)

	for _, userID := range userSet {
		userIDStr := fmt.Sprint(userID)
		if user, found := userMap[userIDStr]; found {
			userlist = append(userlist, user)
		}
	}

	result := paging{
		Total: len(userlist),
		Nodes: userlist,
	}

	renderx.JSON(w, http.StatusOK, result)
}
