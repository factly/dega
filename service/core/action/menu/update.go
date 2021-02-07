package menu

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"gorm.io/gorm"
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

	menuID := chi.URLParam(r, "menu_id")
	id, err := strconv.Atoi(menuID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return

	}

	menu := &menu{}
	err = json.NewDecoder(r.Body).Decode(&menu)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(menu)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := model.Menu{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Menu{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	var menuSlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Menu{})
	tableName := stmt.Schema.Table

	if result.Slug == menu.Slug {
		menuSlug = result.Slug
	} else if menu.Slug != "" && slug.Check(menu.Slug) {
		menuSlug = slug.Approve(menu.Slug, sID, tableName)
	} else {
		menuSlug = slug.Approve(slug.Make(menu.Name), sID, tableName)
	}

	// Check if menu with same name exist
	if menu.Name != result.Name && util.CheckName(uint(sID), menu.Name, tableName) {
		loggerx.Error(errors.New(`menu with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	tx := config.DB.Begin()

	err = tx.Model(&result).Updates(model.Menu{
		Base: config.Base{UpdatedByID: uint(uID)},
		Name: menu.Name,
		Slug: menuSlug,
		Menu: menu.Menu,
	}).First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":       result.ID,
		"kind":     "menu",
		"name":     result.Name,
		"slug":     result.Slug,
		"menu":     result.Menu,
		"space_id": result.SpaceID,
	}

	err = meilisearchx.UpdateDocument("dega", meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, result)
}
