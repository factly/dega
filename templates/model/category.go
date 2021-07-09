package model

import "github.com/jinzhu/gorm/dialects/postgres"

// Category model
type Category struct {
	Base
	Name        string         `gorm:"column:name" json:"name"`
	Slug        string         `gorm:"column:slug" json:"slug"`
	Description postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	ParentID    *uint          `gorm:"column:parent_id;default:NULL" json:"parent_id"`
	MediumID    *uint          `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium      *Medium        `json:"medium"`
	IsFeatured  bool           `gorm:"column:is_featured" json:"is_featured"`
	SpaceID     uint           `gorm:"column:space_id" json:"space_id"`
	Posts       []*Post        `gorm:"many2many:post_categories;" json:"posts"`
	MetaFields  postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
}
