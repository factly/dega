package service

import (
	"context"
	"errors"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

type Menu struct {
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	Name       string         `json:"name" validate:"required,min=3,max=50"`
	Slug       string         `json:"slug"`
	Menu       postgres.Jsonb `json:"menu" swaggertype:"primitive,string"`
	MetaFields postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
}

var userMenuContext config.ContextKey = "menu_user"

type pagingMenu struct {
	Total int64        `json:"total"`
	Nodes []model.Menu `json:"nodes"`
}

type IMenuService interface {
	GetById(sID, id int) (model.Menu, error)
	List(sID uint, offset, limit int) (pagingMenu, []errorx.Message)
	Create(ctx context.Context, sID, uID int, menu *Menu) (model.Menu, []errorx.Message)
	Update(sID, uID, id int, menu *Menu) (model.Menu, []errorx.Message)
	Delete(sID, id int) []errorx.Message
}

type MenuService struct {
	model *gorm.DB
}

func GetMenuService() IMenuService {
	return MenuService{
		model: config.DB.Model(&model.Menu{}),
	}
}

func (ms MenuService) GetById(sID, id int) (model.Menu, error) {
	result := &model.Menu{}

	result.ID = uint(id)

	err := ms.model.Where(&model.Menu{
		SpaceID: uint(sID),
	}).First(&result).Error

	return *result, err
}

func (ms MenuService) List(sID uint, offset, limit int) (pagingMenu, []errorx.Message) {
	result := pagingMenu{}
	result.Nodes = make([]model.Menu, 0)

	err := config.DB.Model(&model.Menu{}).Where(&model.Menu{
		SpaceID: uint(sID),
	}).Order("id desc").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error

	if err != nil {
		loggerx.Error(err)
		return pagingMenu{}, errorx.Parser(errorx.DBError())
	}
	return result, nil
}
func (ms MenuService) Create(ctx context.Context, sID, uID int, menu *Menu) (model.Menu, []errorx.Message) {
	validationError := validationx.Check(menu)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Menu{}, validationError
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
		return model.Menu{}, errorx.Parser(errorx.SameNameExist())
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
	tx := config.DB.WithContext(context.WithValue(ctx, userMenuContext, uID)).Begin()
	err := tx.Model(&model.Menu{}).Create(&result).Error

	if err != nil {
		loggerx.Error(err)
		return model.Menu{}, errorx.Parser(errorx.DBError())
	}

	tx.Model(&model.Menu{}).First(&result)
	tx.Commit()
	return *result, nil
}

func (ms MenuService) Update(sID, uID, id int, menu *Menu) (model.Menu, []errorx.Message) {
	validationError := validationx.Check(menu)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Menu{}, validationError
	}

	result := model.Menu{}
	result.ID = uint(id)
	var menuSlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Menu{})
	tableName := stmt.Schema.Table

	if result.Slug == menu.Slug {
		menuSlug = result.Slug
	} else if menu.Slug != "" && slugx.Check(menu.Slug) {
		menuSlug = slugx.Approve(&config.DB, menu.Slug, sID, tableName)
	} else {
		menuSlug = slugx.Approve(&config.DB, slugx.Make(menu.Name), sID, tableName)
	}

	// Check if menu with same name exist
	if menu.Name != result.Name && util.CheckName(uint(sID), menu.Name, tableName) {
		loggerx.Error(errors.New(`menu with same name exist`))
		return model.Menu{}, errorx.Parser(errorx.SameNameExist())
	}

	tx := config.DB.Begin()

	updateMap := map[string]interface{}{
		"created_at":    menu.CreatedAt,
		"updated_at":    menu.UpdatedAt,
		"updated_by_id": uint(uID),
		"name":          menu.Name,
		"slug":          menuSlug,
		"menu":          menu.Menu,
		"meta_fields":   menu.MetaFields,
	}

	err := tx.Model(&result).Updates(&updateMap).First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Menu{}, errorx.Parser(errorx.DBError())
	}
	tx.Commit()
	return result, nil
}

func (ms MenuService) Delete(sID, id int) []errorx.Message {
	result := &model.Menu{}

	result.ID = uint(id)

	tx := config.DB.Begin()

	err := tx.Delete(&result).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return errorx.Parser(errorx.DBError())
	}
	tx.Commit()

	return nil
}
