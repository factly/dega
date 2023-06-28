package medium

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get medium by id
// @Summary Show a medium by id
// @Description Get medium by ID
// @Tags Medium
// @ID get-medium-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param medium_id path string true "Medium ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {object} model.Medium
// @Router /core/media/{medium_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	mediumID := chi.URLParam(r, "medium_id")
	id, err := strconv.Atoi(mediumID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	mediumService := service.GetMediumService()

	result, err := mediumService.GetById(sID, id)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
