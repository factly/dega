package policy

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func update(w http.ResponseWriter, r *http.Request) {
	spaceID, err := util.GetSpace(r.Context())

	if err != nil {
		return
	}

	userID, err := util.GetUser(r.Context())

	if err != nil {
		return
	}

	space := &model.Space{}
	space.ID = uint(spaceID)

	err = config.DB.First(&space).Error

	if err != nil {
		return
	}

	uID := strconv.Itoa(userID)
	oID := strconv.Itoa(space.OrganisationID)
	sID := strconv.Itoa(spaceID)

	/* delete old policy */

	commanPolicyString := ":org:" + oID + ":app:dega:space:" + sID + ":"
	policyID := chi.URLParam(r, "policy_id")

	policyID = "id" + commanPolicyString + policyID

	req, err := http.NewRequest("DELETE", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies/"+policyID, nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()

	/* create new policy */
	policyReq := policyReq{}

	json.NewDecoder(r.Body).Decode(&policyReq)

	/* User req */

	result := Mapper(Composer(oID, sID, policyReq), author.Mapper(oID, uID))

	renderx.JSON(w, http.StatusOK, result)
}
