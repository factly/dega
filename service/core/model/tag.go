package model

import "github.com/jinzhu/gorm"

// Tag model
type Tag struct {
	gorm.Model
	Name           string `gorm:"column:name" json:"name" validate:"required"`
	Slug           string `gorm:"column:slug" json:"slug" validate:"required"`
	Description    string `gorm:"column:description" json:"description"`
	ProfileImageID uint   `gorm:"column:profile_image_id" json:"profile_image_id"`
	CreatedByID    uint   `gorm:"column:created_by_id" json:"created_by_id"`
	SpaceID        uint   `gorm:"column:space_id" json:"space_id"`
	MetaFields     string `gorm:"column:meta_fields" json:"meta_fields"`
}

// MetaFields - json
