package policy

import (
	"fmt"
	"net/http"
	"os"

	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func delete(w http.ResponseWriter, r *http.Request) {
	spaceID, err := util.GetSpace(r.Context())

	if err != nil {
		return
	}

	organisationID, err := util.GetOrganisation(r.Context())

	if err != nil {
		return
	}

	/* delete old policy */
	policyID := chi.URLParam(r, "policy_id")

	policyID = fmt.Sprint("id:org:", organisationID, ":app:dega:space:", spaceID, ":"+policyID)

	req, err := http.NewRequest("DELETE", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies/"+policyID, nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	defer resp.Body.Close()

	renderx.JSON(w, http.StatusOK, nil)
}
