package menu

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/x/loggerx"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
)

// create - Create menu
// @Summary Create menu
// @Description Create menu
// @Tags Menu
// @ID add-menu
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Menu body menu true "Menu Object"
// @Success 201 {object} model.Menu
// @Failure 400 {array} string
// @Router /core/menus [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
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
	result, serviceErr := menuService.Create(r.Context(), sID, uID, menu)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":       result.ID,
		"name":     result.Name,
		"slug":     result.Slug,
		"menu":     result.Menu,
		"space_id": result.SpaceID,
	}

	if config.SearchEnabled() {
		_ = meilisearchx.AddDocument(util.IndexMenus.String(), meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("menu.created", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("menu.created", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusCreated, result)
}
