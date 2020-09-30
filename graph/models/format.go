package models

import (
	"time"
)

// Format model
type Format struct {
	ID          uint      `gorm:"primary_key" json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Name        string    `gorm:"column:name" json:"name" validate:"required"`
	Slug        string    `gorm:"column:slug" json:"slug" validate:"required"`
	Description string    `gorm:"column:description" json:"description"`
	SpaceID     uint      `gorm:"column:space_id" json:"space_id"`
}

// FormatsPaging model
type FormatsPaging struct {
	Nodes []*Format `json:"nodes"`
	Total int       `json:"total"`
}
