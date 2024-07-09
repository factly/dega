package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Menu model
type Menu struct {
	ID         uuid.UUID       `gorm:"primary_key" json:"id"`
	CreatedAt  time.Time       `json:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at"`
	DeletedAt  *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	Name       string          `gorm:"column:name" json:"name"`
	Slug       string          `gorm:"column:slug" json:"slug"`
	Menu       postgres.Jsonb  `gorm:"column:menu" json:"menu"`
	MetaFields postgres.Jsonb  `gorm:"column:meta_fields" json:"meta_fields"`
	SpaceID    uuid.UUID       `gorm:"column:space_id" json:"space_id"`
}

// MenusPaging model
type MenusPaging struct {
	Nodes []*Menu `json:"nodes"`
	Total int     `json:"total"`
}
