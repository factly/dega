package menu

import (
	"net/http"

	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list - Get all menus
// @Summary Show all menus
// @Description Get all menus
// @Menus Menu
// @ID get-all-menus
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /core/menus [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	offset, limit := paginationx.Parse(r.URL.Query())
	menuService := service.GetMenuService()
	result, errMessages := menuService.List(uint(sID), offset, limit)
	if errMessages != nil {
		errorx.Render(w, errMessages)
		return
	}
	renderx.JSON(w, http.StatusOK, result)
}
