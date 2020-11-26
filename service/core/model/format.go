package model

import (
	"github.com/factly/dega-server/config"
	"gorm.io/gorm"
)

// Format model
type Format struct {
	config.Base
	Name        string `gorm:"column:name" json:"name" validate:"required"`
	Slug        string `gorm:"column:slug" json:"slug" validate:"required"`
	Description string `gorm:"column:description" json:"description"`
	SpaceID     uint   `gorm:"column:space_id" json:"space_id"`
	Space       *Space `json:"space,omitempty"`
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
