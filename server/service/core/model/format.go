package model

import (
	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Format model
type Format struct {
	config.Base
	Name        string         `gorm:"column:name" json:"name" validate:"required"`
	Slug        string         `gorm:"column:slug" json:"slug" validate:"required"`
	Description string         `gorm:"column:description" json:"description"`
	MetaFields  postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	Meta        postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode  string         `gorm:"column:header_code" json:"header_code"`
	FooterCode  string         `gorm:"column:footer_code" json:"footer_code"`
	SpaceID     uint           `gorm:"column:space_id" json:"space_id"`
	Space       *Space         `json:"space,omitempty"`
}

var formatUser config.ContextKey = "format_user"

// BeforeCreate hook
func (format *Format) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(formatUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	format.CreatedByID = uint(uID)
	format.UpdatedByID = uint(uID)
	return nil
}
