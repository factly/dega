package models

import (
	"time"
)

// Claimant model
type Claimant struct {
	ID          uint      `gorm:"primary_key" json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Name        string    `gorm:"column:name" json:"name"`
	Slug        string    `gorm:"column:slug" json:"slug"`
	Description string    `gorm:"column:description" json:"description"`
	TagLine     string    `gorm:"column:tag_line" json:"tag_line"`
	MediumID    uint      `gorm:"column:medium_id" json:"medium_id" sql:"DEFAULT:NULL"`
	Medium      Medium    `gorm:"foreignkey:medium_id;association_foreignkey:id" json:"medium"`
	SpaceID     uint      `gorm:"column:space_id" json:"space_id"`
}

// ClaimantsPaging model
type ClaimantsPaging struct {
	Nodes []*Claimant `json:"nodes"`
	Total int         `json:"total"`
}
