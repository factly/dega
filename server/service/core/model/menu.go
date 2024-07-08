package model

import (
	"github.com/factly/dega-server/config"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Menu model
type Menu struct {
	config.Base
	Name       string         `gorm:"column:name" json:"name" validate:"required"`
	Slug       string         `gorm:"column:slug" json:"slug" validate:"required"`
	Menu       postgres.Jsonb `gorm:"column:menu" json:"menu" swaggertype:"primitive,string"`
	SpaceID    uuid.UUID      `gorm:"type:uuid;column:space_id" json:"space_id"`
	MetaFields postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
}

// BeforeCreate hook
func (menu *Menu) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(config.UserContext)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	menu.CreatedByID = uID
	menu.UpdatedByID = uID
	menu.ID = uuid.New()
	return nil
}
