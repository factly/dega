package model

import (
	"github.com/factly/dega-server/config"
)

// Format model
/* add additional_fields */
type Format struct {
	config.Base
	Name        string `gorm:"column:name" json:"name" validate:"required"`
	Slug        string `gorm:"column:slug" json:"slug" validate:"required"`
	Description string `gorm:"column:description" json:"description"`
	IsDefault   bool   `gorm:"column:is_default" json:"is_default"`
	SpaceID     uint   `gorm:"column:space_id" json:"space_id"`
}
