package menu

import (
	"encoding/json"
	"net/http"

	"github.com/factly/x/loggerx"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"

	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
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

	authCtx, err := util.GetAuthCtx(r.Context())
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
	result, serviceErr := menuService.Create(r.Context(), authCtx.SpaceID, authCtx.UserID, menu)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":       result.ID.String(),
		"name":     result.Name,
		"slug":     result.Slug,
		"menu":     result.Menu,
		"space_id": result.SpaceID,
	}

	if config.SearchEnabled() {
		_ = meilisearch.AddDocument(meiliIndex, meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("menu.created", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("menu.created", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusCreated, result)
}
