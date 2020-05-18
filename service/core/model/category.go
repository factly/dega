package model

import (
	"github.com/factly/dega-server/config"
)

// Category model
type Category struct {
	config.Base
	Name        string `gorm:"column:name" json:"name" validate:"required"`
	Slug        string `gorm:"column:slug" json:"slug" validate:"required"`
	Description string `gorm:"column:description" json:"description"`
	ParentID    uint   `gorm:"column:parent_id" json:"parent_id"`
	MediumID    uint   `gorm:"column:medium_id" json:"medium_id"`
	Medium      Medium `gorm:"foreignkey:medium_id;association_foreignkey:id" json:"medium"`
}
