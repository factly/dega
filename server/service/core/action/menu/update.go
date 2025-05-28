package menu

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

// update - Update menu by id
// @Summary Update a menu by id
// @Description Update menu by ID
// @Tags Menu
// @ID update-menu-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param menu_id path string true "Menu ID"
// @Param X-Space header string true "Space ID"
// @Param Menu body menu false "Menu"
// @Success 200 {object} model.Menu
// @Router /core/menus/{menu_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	menuID := chi.URLParam(r, "menu_id")
	id, err := uuid.Parse(menuID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return

	}

	menu := &service.Menu{}
	err = json.NewDecoder(r.Body).Decode(&menu)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	menuService := service.GetMenuService()
	_, err = menuService.GetById(authCtx.SpaceID, id)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	result, serviceErr := menuService.Update(authCtx.SpaceID, id, authCtx.UserID, menu)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":       result.ID,
		"name":     result.Name,
		"slug":     result.Slug,
		"menu":     result.Menu,
		"space_id": result.SpaceID,
	}

	if config.SearchEnabled() {
		_ = meilisearch.UpdateDocument(meiliIndex, meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("menu.updated", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("menu.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, result)
}
