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

func details(w http.ResponseWriter, r *http.Request) {
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

	oID := strconv.Itoa(space.OrganisationID)
	sID := strconv.Itoa(spaceID)

	policyID := chi.URLParam(r, "policy_id")

	ketoPolicyID := "id:org:" + oID + ":app:dega:space:" + sID + ":" + policyID

	req, err := http.NewRequest("GET", os.Getenv("KETO_URL")+"/engines/acp/ory/regex/policies/"+ketoPolicyID, nil)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()

	ketoPolicy := model.KetoPolicy{}

	json.NewDecoder(resp.Body).Decode(&ketoPolicy)

	/* User req */
	userMap := author.Mapper(strconv.Itoa(space.OrganisationID), strconv.Itoa(userID))

	result := Mapper(ketoPolicy, userMap)

	renderx.JSON(w, http.StatusOK, result)
}
