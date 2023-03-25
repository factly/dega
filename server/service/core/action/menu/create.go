package menu

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	searchService "github.com/factly/dega-server/util/search-service"
	"github.com/factly/x/loggerx"
	"gorm.io/gorm"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
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

	var menuSlug string
	if menu.Slug != "" && slugx.Check(menu.Slug) {
		menuSlug = menu.Slug
	} else {
		menuSlug = slugx.Make(menu.Name)
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Menu{})
	tableName := stmt.Schema.Table

	// Check if menu with same name exist
	if util.CheckName(uint(sID), menu.Name, tableName) {
		loggerx.Error(errors.New(`menu with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	result := &model.Menu{
		Base: config.Base{
			CreatedAt: menu.CreatedAt,
			UpdatedAt: menu.UpdatedAt,
		},
		Name:       menu.Name,
		Menu:       menu.Menu,
		Slug:       slugx.Approve(&config.DB, menuSlug, sID, tableName),
		MetaFields: menu.MetaFields,
		SpaceID:    uint(sID),
	}
	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	err = tx.Model(&model.Menu{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Menu{}).First(&result)

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":       result.ID,
		"kind":     "menu",
		"name":     result.Name,
		"slug":     result.Slug,
		"menu":     result.Menu,
		"space_id": result.SpaceID,
	}

	if config.SearchEnabled() {
		err = searchService.GetSearchService().Add(meiliObj)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	tx.Commit()

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
