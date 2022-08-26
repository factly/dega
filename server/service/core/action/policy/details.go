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
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// details - Get policy by ID
// @Summary Get policy by ID
// @Description Get policy by ID
// @Tags Policy
// @ID get-policy-by-id
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param policy_id path string true "Policy ID"
// @Success 200 {object} model.Policy
// @Router /core/policies/{policy_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	spaceID, err := middlewarex.GetSpace(r.Context())

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	userID, err := middlewarex.GetUser(r.Context())

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

	policyID := chi.URLParam(r, "policy_id")

	reqURL := viper.GetString("kavach_url") + fmt.Sprintf("/organisations/%d/applications/%d/spaces/%d/policy/%s", organisationID, viper.GetInt("dega_application_id"), spaceID, policyID)
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

	if resp.StatusCode != http.StatusOK {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	policy := model.KavachPolicy{}
	err = json.NewDecoder(resp.Body).Decode(&policy)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	renderx.JSON(w, http.StatusOK, policy)
}
