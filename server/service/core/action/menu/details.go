package menu

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

// details - Get menu by id
// @Summary Show a menu by id
// @Description Get menu by ID
// @Tags Menu
// @ID get-menu-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param menu_id path string true "Menu ID"
// @Success 200 {object} model.Menu
// @Router /core/menus/{menu_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	menuID := chi.URLParam(r, "menu_id")
	id, err := strconv.Atoi(menuID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	menuService := service.GetMenuService()

	result, err := menuService.GetById(sID, id)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
