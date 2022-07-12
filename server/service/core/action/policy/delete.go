package policy

import (
	"fmt"
	"net/http"

	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// delete - Delete policy by ID
// @Summary Delete policy by ID
// @Description GeDeletet policy by ID
// @Tags Policy
// @ID delete-policy-by-id
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param policy_id path string true "Policy ID"
// @Success 200 {object} model.Policy
// @Router /core/policies/{policy_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
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

	/* delete old policy */
	policyId := chi.URLParam(r, "policy_id")

	policyID := fmt.Sprint("id:org:", organisationID, ":app:dega:space:", spaceID, ":"+policyId)

	req, err := http.NewRequest("DELETE", viper.GetString("keto_url")+"/engines/acp/ory/regex/policies/"+policyID, nil)
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

	objectID := fmt.Sprint("policy_", policyId)
	_, err = meilisearchx.Client.Index("dega").Delete(objectID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
