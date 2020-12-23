package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// Category model
type Category struct {
	ID          uint           `gorm:"primary_key" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Name        string         `gorm:"column:name" json:"name"`
	Slug        string         `gorm:"column:slug" json:"slug"`
	Description postgres.Jsonb `gorm:"column:description" json:"description"`
	ParentID    uint           `gorm:"column:parent_id" json:"parent_id" sql:"DEFAULT:NULL"`
	MediumID    uint           `gorm:"column:medium_id" json:"medium_id" sql:"DEFAULT:NULL"`
	SpaceID     uint           `gorm:"column:space_id" json:"space_id"`
	MetaFields  postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
}

// CategoriesPaging model
type CategoriesPaging struct {
	Nodes []*Category `json:"nodes"`
	Total int         `json:"total"`
}
