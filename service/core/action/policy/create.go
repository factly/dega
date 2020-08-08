package policy

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

func create(w http.ResponseWriter, r *http.Request) {
	spaceID, err := util.GetSpace(r.Context())

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	userID, err := util.GetUser(r.Context())

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	organisationID, err := util.GetOrganisation(r.Context())

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	policyReq := policyReq{}

	json.NewDecoder(r.Body).Decode(&policyReq)

	result := Mapper(Composer(organisationID, spaceID, policyReq), author.Mapper(organisationID, userID))

	renderx.JSON(w, http.StatusOK, result)
}
