package model

import (
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Tag tag model
type Tag struct {
	Base
	Name        string         `gorm:"column:name" json:"name" validate:"required"`
	Slug        string         `gorm:"column:slug" json:"slug" validate:"required"`
	Description postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	IsFeatured  bool           `gorm:"column:is_featured" json:"is_featured"`
	SpaceID     uint           `gorm:"column:space_id" json:"space_id"`
	Posts       []*Post        `gorm:"many2many:post_tags;" json:"posts"`
}
