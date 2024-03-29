package policy

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	httpx "github.com/factly/dega-server/util/http"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// update - Update policy
// @Summary Update policy
// @Description Update policy
// @Tags Policy
// @ID update-policy
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Policy body policyReq true "Policy Object"
// @Param policy_id path string true "Policy ID"
// @Success 200 {object} model.Policy
// @Router /core/policies/{policy_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
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

	applicationID, err := util.GetApplicationID(uint(userID), "dega")
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	policyID := chi.URLParam(r, "policy_id")
	/* create new policy */
	policyReq := kavachPolicy{}
	err = json.NewDecoder(r.Body).Decode(&policyReq)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	buf := new(bytes.Buffer)
	err = json.NewEncoder(buf).Encode(policyReq)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	requrl := viper.GetString("kavach_url") + "/organisations/" + fmt.Sprintf("%d", organisationID) + "/applications/" + fmt.Sprintf("%d", applicationID) + "/spaces/" + fmt.Sprintf("%d", spaceID) + "/policy/" + policyID
	req, err := http.NewRequest(http.MethodPut, requrl, buf)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	req.Header.Set("X-User", strconv.Itoa(userID))
	req.Header.Set("Content-Type", "application/json")

	client := httpx.CustomHttpClient()
	resp, err := client.Do(req)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		loggerx.Error(errors.New("internal server error on kavach server"))
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	result := &model.KavachPolicy{}
	err = json.NewDecoder(resp.Body).Decode(result)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// Update into meili index

	if config.SearchEnabled() {
		meiliObj := map[string]interface{}{
			"id":          result.ID,
			"kind":        "policy",
			"name":        result.Name,
			"description": result.Description,
		}
		err = meilisearchx.UpdateDocument("dega", meiliObj)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("policy.updated", strconv.Itoa(spaceID), r) {
			if err = util.NC.Publish("policy.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, result)
}
