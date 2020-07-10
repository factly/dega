package policy

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func details(w http.ResponseWriter, r *http.Request) {
	spaceID, err := util.GetSpace(r.Context())

	if err != nil {
		return
	}

	userID, err := util.GetUser(r.Context())

	if err != nil {
		return
	}

	organisationID, err := util.GetOrganisation(r.Context())

	if err != nil {
		return
	}

	policyID := chi.URLParam(r, "policy_id")

	ketoPolicyID := fmt.Sprint("id:org:", organisationID, ":app:dega:space:", spaceID, ":", policyID)

	req, err := http.NewRequest("GET", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies/"+ketoPolicyID, nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	defer resp.Body.Close()

	ketoPolicy := model.KetoPolicy{}

	json.NewDecoder(resp.Body).Decode(&ketoPolicy)

	/* User req */
	userMap := author.Mapper(organisationID, userID)

	result := Mapper(ketoPolicy, userMap)

	renderx.JSON(w, http.StatusOK, result)
}
