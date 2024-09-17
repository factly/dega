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
	"github.com/factly/x/validationx"
	"github.com/google/uuid"
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

type pagingMenu struct {
	Total int64        `json:"total"`
	Nodes []model.Menu `json:"nodes"`
}

type IMenuService interface {
	GetById(sID, id uuid.UUID) (model.Menu, error)
	List(sID uuid.UUID, offset, limit int) (pagingMenu, []errorx.Message)
	Create(ctx context.Context, sID uuid.UUID, uID string, menu *Menu) (model.Menu, []errorx.Message)
	Update(sID, id uuid.UUID, uID string, m model.Menu, menu *Menu) (model.Menu, []errorx.Message)
	Delete(sID, id uuid.UUID) []errorx.Message
}

type MenuService struct {
	model *gorm.DB
}

func GetMenuService() IMenuService {
	return MenuService{
		model: config.DB.Model(&model.Menu{}),
	}
}

func (ms MenuService) GetById(sID, id uuid.UUID) (model.Menu, error) {
	result := &model.Menu{}

	result.ID = id

	err := ms.model.Where(&model.Menu{
		SpaceID: sID,
	}).First(&result).Error

	return *result, err
}

func (ms MenuService) List(sID uuid.UUID, offset, limit int) (pagingMenu, []errorx.Message) {
	result := pagingMenu{}
	result.Nodes = make([]model.Menu, 0)

	err := config.DB.Model(&model.Menu{}).Where(&model.Menu{
		SpaceID: sID,
	}).Order("id desc").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error

	if err != nil {
		loggerx.Error(err)
		return pagingMenu{}, errorx.Parser(errorx.DBError())
	}
	return result, nil
}
func (ms MenuService) Create(ctx context.Context, sID uuid.UUID, uID string, menu *Menu) (model.Menu, []errorx.Message) {
	validationError := validationx.Check(menu)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Menu{}, validationError
	}

	var menuSlug string
	if menu.Slug != "" && util.CheckSlug(menu.Slug) {
		menuSlug = menu.Slug
	} else {
		menuSlug = util.MakeSlug(menu.Name)
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Menu{})
	tableName := stmt.Schema.Table

	// Check if menu with same name exist
	if util.CheckName(sID, menu.Name, tableName) {
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
		Slug:       util.ApproveSlug(menuSlug, sID, tableName),
		MetaFields: menu.MetaFields,
		SpaceID:    sID,
	}
	tx := config.DB.WithContext(context.WithValue(ctx, config.UserContext, uID)).Begin()
	err := tx.Model(&model.Menu{}).Create(&result).Error

	if err != nil {
		loggerx.Error(err)
		return model.Menu{}, errorx.Parser(errorx.DBError())
	}

	tx.Model(&model.Menu{}).First(&result)
	tx.Commit()
	return *result, nil
}

func (ms MenuService) Update(sID, id uuid.UUID, uID string, m model.Menu, menu *Menu) (model.Menu, []errorx.Message) {
	validationError := validationx.Check(menu)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Menu{}, validationError
	}

	result := model.Menu{}
	result.ID = id
	var menuSlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Menu{})
	tableName := stmt.Schema.Table

	if menu.Slug != m.Slug {
		menuSlug = util.ApproveSlug(menu.Slug, sID, tableName)
	}

	// Check if menu with same name exist
	if menu.Name != m.Name && util.CheckName(sID, menu.Name, tableName) {
		loggerx.Error(errors.New(`menu with same name exist`))
		return model.Menu{}, errorx.Parser(errorx.SameNameExist())
	}

	tx := config.DB.Begin()

	updateMap := map[string]interface{}{
		"created_at":    menu.CreatedAt,
		"updated_at":    menu.UpdatedAt,
		"updated_by_id": uID,
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

func (ms MenuService) Delete(sID, id uuid.UUID) []errorx.Message {
	result := &model.Menu{}

	result.ID = id

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
