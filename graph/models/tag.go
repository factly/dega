package models

import (
	"time"

	"gorm.io/gorm"
)

// Tag model
type Tag struct {
	ID          uint            `gorm:"primary_key" json:"id"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	DeletedAt   *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	Name        string          `gorm:"column:name" json:"name" validate:"required"`
	Slug        string          `gorm:"column:slug" json:"slug" validate:"required"`
	Description string          `gorm:"column:description" json:"description"`
	SpaceID     uint            `gorm:"column:space_id" json:"space_id"`
}

// TagsPaging model
type TagsPaging struct {
	Nodes []*Tag `json:"nodes"`
	Total int    `json:"total"`
}
