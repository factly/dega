package space

import (
	"net/http"
	"strconv"

	//	"github.com/factly/dega-server/config"

	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get space by id
// @Summary Show a space by id
// @Description Get space by ID
// @Tags Space
// @ID get-space-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param space_id path string true "Space ID"
// @Success 200 {object} model.Space
// @Router /core/spaces/{space_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	sID := chi.URLParam(r, "space_id")
	spaceID, err := strconv.Atoi(sID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	orgID, err := util.GetOrganisationIDfromSpaceID(uint(spaceID), uint(uID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	spaceObjectforDega, err := util.GetSpacefromKavach(uint(uID), uint(orgID), uint(spaceID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	renderx.JSON(w, http.StatusOK, spaceObjectforDega)
}
