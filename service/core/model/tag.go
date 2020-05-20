package model

import (
	"github.com/factly/dega-server/config"
)

// Tag model
type Tag struct {
	config.Base
	Name        string `gorm:"column:name" json:"name" validate:"required"`
	Slug        string `gorm:"column:slug" json:"slug" validate:"required"`
	Description string `gorm:"column:description" json:"description"`
	SpaceID     uint   `gorm:"column:space_id" json:"space_id"`
}
