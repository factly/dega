package policy

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/renderx"
)

func create(w http.ResponseWriter, r *http.Request) {
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

	policyReq := policyReq{}

	json.NewDecoder(r.Body).Decode(&policyReq)

	result := Mapper(Composer(oID, sID, policyReq), author.Mapper(oID, uID))

	renderx.JSON(w, http.StatusOK, result)
}
