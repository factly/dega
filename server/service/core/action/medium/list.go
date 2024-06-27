package medium

import (
	"net/http"

	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list - Get all media
// @Summary Show all media
// @Description Get all media
// @Tags Medium
// @ID get-all-media
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param q query string false "Query"
// @Param sort query string false "Sort"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {array} model.Medium
// @Router /core/media [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")
	offset, limit := paginationx.Parse(r.URL.Query())

	mediumService := service.GetMediumService()
	result, errMessages := mediumService.List(sID, offset, limit, searchQuery, sort)
	if errMessages != nil {
		errorx.Render(w, errMessages)
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
