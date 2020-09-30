package models

import (
	"time"
)

// Rating model
type Rating struct {
	ID           uint      `gorm:"primary_key" json:"id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Name         string    `gorm:"column:name" json:"name"`
	Slug         string    `gorm:"column:slug" json:"slug"`
	Description  string    `gorm:"column:description" json:"description"`
	NumericValue int       `gorm:"column:numeric_value" json:"numeric_value"`
	MediumID     uint      `gorm:"column:medium_id" json:"medium_id" sql:"DEFAULT:NULL"`
	SpaceID      uint      `gorm:"column:space_id" json:"space_id"`
}

// RatingsPaging model
type RatingsPaging struct {
	Nodes []*Rating `json:"nodes"`
	Total int       `json:"total"`
}
