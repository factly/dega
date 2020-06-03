package policy

import (
	"net/http"
	"os"

	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

func delete(w http.ResponseWriter, r *http.Request) {
	spaceID := chi.URLParam(r, "space_id")

	organisationID := r.Header.Get("X-Organisation")

	/* delete old policy */
	policyID := chi.URLParam(r, "policy_id")

	policyID = "id:org:" + organisationID + ":app:dega:space:" + spaceID + ":" + policyID

	req, err := http.NewRequest("DELETE", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies/"+policyID, nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()

	render.JSON(w, http.StatusOK, nil)
}
