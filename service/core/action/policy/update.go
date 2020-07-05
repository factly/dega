package policy

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/factly/dega-server/errors"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func update(w http.ResponseWriter, r *http.Request) {
	spaceID, err := util.GetSpace(r.Context())

	if err != nil {
		errors.Render(w, errors.Parser(errors.InternalServerError()), 500)
		return
	}

	userID, err := util.GetUser(r.Context())

	if err != nil {
		errors.Render(w, errors.Parser(errors.InternalServerError()), 500)
		return
	}

	organisationID, err := util.GetOrganization(r.Context())

	if err != nil {
		errors.Render(w, errors.Parser(errors.InternalServerError()), 500)
		return
	}

	/* delete old policy */

	commanPolicyString := fmt.Sprint(":org:", organisationID, ":app:dega:space:", spaceID, ":")
	policyID := chi.URLParam(r, "policy_id")

	policyID = "id" + commanPolicyString + policyID

	req, err := http.NewRequest("DELETE", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies/"+policyID, nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		errors.Render(w, errors.Parser(errors.NetworkError()), 503)
		return
	}

	defer resp.Body.Close()

	/* create new policy */
	policyReq := policyReq{}

	json.NewDecoder(r.Body).Decode(&policyReq)

	/* User req */

	result := Mapper(Composer(organisationID, spaceID, policyReq), author.Mapper(organisationID, userID))

	renderx.JSON(w, http.StatusOK, result)
}
