package policy

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
)

// create - Create policy
// @Summary Create policy
// @Description Create policy
// @Tags Policy
// @ID add-policy
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Policy body policyReq true "Policy Object"
// @Success 201 {object} model.Policy
// @Router /core/policies [post]
func create(w http.ResponseWriter, r *http.Request) {
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

	policyReq := policyReq{}

	err = json.NewDecoder(r.Body).Decode(&policyReq)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	result := Mapper(Composer(organisationID, spaceID, policyReq), author.Mapper(organisationID, userID))

	err = insertIntoMeili(result)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("policy.created", strconv.Itoa(spaceID), r) {
			if err = util.NC.Publish("policy.created", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, result)
}

func insertIntoMeili(result model.Policy) error {
	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":          result.ID,
		"kind":        "policy",
		"name":        result.Name,
		"description": result.Description,
	}

	return meilisearchx.AddDocument("dega", meiliObj)
}
