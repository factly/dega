package model

import (
	"github.com/jinzhu/gorm"
)

// Category model
type Category struct {
	gorm.Model
	Name        string     `gorm:"column:name" json:"name"`
	Slug        string     `gorm:"column:slug" json:"slug"`
	Description string     `gorm:"column:description" json:"description"`
	ParentID    uint       `gorm:"column:parent_id" json:"parent_id"`
	MediumID    uint       `gorm:"column:medium_id" json:"medium_id"`
	Medium      Medium     `gorm:"foreignkey:medium_id;association_foreignkey:id" json:"medium"`
	Children    []Category `json:"children"`
}
