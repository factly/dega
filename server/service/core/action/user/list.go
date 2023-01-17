package user

// import (
// 	"encoding/json"
// 	"fmt"
// 	"net/http"
// 	"strconv"
// 	"strings"

// 	"github.com/factly/dega-server/service/core/action/author"
// 	"github.com/factly/dega-server/service/core/action/policy"

// 	"github.com/factly/dega-server/service/core/model"
// 	"github.com/factly/dega-server/util"
// 	"github.com/factly/x/middlewarex"

// 	"github.com/factly/x/errorx"
// 	"github.com/factly/x/loggerx"
// 	"github.com/factly/x/renderx"
// )

// // list response
// type paging struct {
// 	Total int          `json:"total"`
// 	Nodes []userPolicy `json:"nodes"`
// }

// type userPolicy struct {
// 	model.Author
// 	Policies []policyRes `json:"policies"`
// }

// type policyRes struct {
// 	ID          string `json:"id"`
// 	Name        string `json:"name"`
// 	Description string `json:"description"`
// }

// // list - Get users with space access
// // @Summary Get users with space access
// // @Description Get users with space access
// // @Tags Users
// // @ID get-space-users
// // @Consume json
// // @Produce json
// // @Param X-User header string true "User ID"
// // @Param X-Space header string true "Space ID"
// // @Success 200 {object} paging
// // @Router /core/users [get]
// func list(w http.ResponseWriter, r *http.Request) {
// 	sID, err := middlewarex.GetSpace(r.Context())
// 	if err != nil {
// 		loggerx.Error(err)
// 		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
// 		return
// 	}

// 	oID, err := util.GetOrganisation(r.Context())
// 	if err != nil {
// 		loggerx.Error(err)
// 		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
// 		return
// 	}

// 	// defer resp.Body.Close()

// 	// adminRole := model.User{}
// 	// err = json.NewDecoder(resp.Body).Decode(&adminRole)
// 	// if err != nil {
// 	// 	loggerx.Error(err)
// 	// 	errorx.Render(w, errorx.Parser(errorx.DecodeError()))
// 	// 	return
// 	// }

// 	// for _, member := range adminRole.Members {
// 	// 	memid, _ := strconv.Atoi(member)
// 	// 	userIDsMap[uint(memid)] = []policyRes{
// 	// 		policyRes{
// 	// 			ID:   "admin",
// 	// 			Name: "admin",
// 	// 		},
// 	// 	}
// 	// }

// 	// Get all policies
// 	policyList, err := policy.GetAllPolicies()
// 	if err != nil {
// 		loggerx.Error(err)
// 		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
// 		return
// 	}

// 	prefixName := fmt.Sprint("id:org:", oID, ":app:dega:space:", sID, ":")

// 	// append subjects whose id has prefix for our space
// 	for _, policy := range policyList {
// 		if strings.HasPrefix(policy.ID, prefixName) {
// 			policyNameTokens := strings.Split(policy.ID, ":")
// 			policyID := policyNameTokens[len(policyNameTokens)-1]

// 			for _, subject := range policy.Subjects {
// 				subid, _ := strconv.Atoi(subject)

// 				if _, found := userIDsMap[uint(subid)]; !found {
// 					userIDsMap[uint(subid)] = make([]policyRes, 0)
// 				}
// 				polRes := policyRes{
// 					ID:          policyID,
// 					Name:        policyID,
// 					Description: policy.Description,
// 				}
// 				userIDsMap[uint(subid)] = append(userIDsMap[uint(subid)], polRes)
// 			}
// 		}
// 	}

// 	// Fetch all the users
// 	userMap, err := author.All(r.Context())
// 	if err != nil {
// 		loggerx.Error(err)
// 		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
// 		return
// 	}

// 	result := paging{}

// 	userlist := make([]userPolicy, 0)

// 	for usrID, pol := range userIDsMap {
// 		userIDStr := fmt.Sprint(usrID)
// 		if user, found := userMap[userIDStr]; found {
// 			usrpol := userPolicy{
// 				Policies: pol,
// 				Author:   user,
// 			}
// 			userlist = append(userlist, usrpol)
// 		}
// 	}

// 	result.Nodes = userlist
// 	result.Total = len(userlist)

// 	renderx.JSON(w, http.StatusOK, result)
// }
