package space

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/zitadel"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

type organisation struct {
	ID     string        `json:"id"`
	Title  string        `json:"title"`
	Slug   string        `json:"slug"`
	Spaces []model.Space `json:"spaces"`
}

type orgWithSpace struct {
	organisation
	Spaces []model.Space `json:"spaces"`
}

// list - Get all spaces for a user
// @Summary Show all spaces
// @Description Get all spaces
// @Tags Space
// @ID get-all-spaces
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {array} orgWithSpace
// @Router /core/spaces [get]
func my(w http.ResponseWriter, r *http.Request) {
	_, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// Fetched all organisations of the user
	orgs := zitadel.GetOrganisations(r.Header.Get("Authorization"))

	allOrg := []orgWithSpace{}

	for idx, org := range orgs {
		allOrg = append(allOrg, orgWithSpace{
			organisation: organisation{
				ID:    org.ID,
				Title: org.Name,
			}})

		allOrg[idx].organisation.Spaces = make([]model.Space, 0)

		config.DB.Model(&model.Space{}).Where("organisation_id = ?", org.ID).Find(&allOrg[idx].Spaces)
	}

	renderx.JSON(w, http.StatusOK, allOrg)
}
