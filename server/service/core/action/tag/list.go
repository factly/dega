package tag

import (
	"net/http"

	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list - Get all tags
// @Summary Show all tags
// @Description Get all tags
// @Tags Tag
// @ID get-all-tags
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Param q query string false "Query"
// @Param sort query string false "Sort"
// @Success 200 {array} paging
// @Router /core/tags [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")

	if sort != "asc" {
		sort = "desc"
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	tagService := service.GetTagService()
	result, errMessages := tagService.List(uint(sID), offset, limit, searchQuery, sort)
	if errMessages != nil {
		errorx.Render(w, errMessages)
		return
	}
	renderx.JSON(w, http.StatusOK, result)
}
