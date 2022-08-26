package policy

import (
	"encoding/json"
	"fmt"
	"net/http"

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
	Total int                  `json:"total"`
	Nodes []model.KavachPolicy `json:"nodes"`
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

	spaceID, err := middlewarex.GetSpace(r.Context())
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

	reqURL := viper.GetString("kavach_url") + fmt.Sprintf("/organisations/%d/applications/%d/spaces/%d/policy", organisationID, viper.GetInt("dega_application_id"), spaceID)
	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	req.Header.Set("X-User", fmt.Sprintf("%d", userID))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	defer resp.Body.Close()

	var polices []model.KavachPolicy

	err = json.NewDecoder(resp.Body).Decode(&polices)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	total := len(polices)
	lowerLimit := offset
	upperLimit := offset + limit
	if offset > total {
		lowerLimit = 0
		upperLimit = 0
	} else if offset+limit > total {
		lowerLimit = offset
		upperLimit = total
	}

	polices = polices[lowerLimit:upperLimit]
	var result paging
	result.Nodes = polices
	result.Total = total
	renderx.JSON(w, http.StatusOK, result)
}
