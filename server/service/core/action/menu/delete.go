package menu

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete menu by id
// @Summary Delete a menu
// @Description Delete menu by ID
// @Tags Menu
// @ID delete-menu-by-id
// @Param X-User header string true "User ID"
// @Param menu_id path string true "Menu ID"
// @Param X-Space header string true "Space ID"
// @Success 200
// @Failure 400 {array} string
// @Router /core/menus/{menu_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	menuID := chi.URLParam(r, "menu_id")
	id, err := strconv.Atoi(menuID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	menuService := service.GetMenuService()
	result, err := menuService.GetById(sID, id)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	serviceErr := menuService.Delete(sID, id)
	if serviceErr != nil {
		loggerx.Error(err)
		errorx.Render(w, serviceErr)
		return
	}

	if config.SearchEnabled() {
		_ = meilisearchx.DeleteDocument("dega", result.ID, "menu")
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("menu.deleted", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("menu.deleted", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusOK, nil)
}
