package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// Claim model
type Claim struct {
	ID            uint           `gorm:"primary_key" json:"id"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	Title         string         `gorm:"column:title" json:"title"`
	Slug          string         `gorm:"column:slug" json:"slug"`
	ClaimDate     time.Time      `gorm:"column:claim_date" json:"claim_date" sql:"DEFAULT:NULL"`
	CheckedDate   time.Time      `gorm:"column:checked_date" json:"checked_date" sql:"DEFAULT:NULL"`
	ClaimSources  string         `gorm:"column:claim_sources" json:"claim_sources"`
	Description   postgres.Jsonb `gorm:"column:description" json:"description"`
	ClaimantID    uint           `gorm:"column:claimant_id" json:"claimant_id"`
	Claimant      Claimant       `gorm:"foreignkey:claimant_id;association_foreignkey:id" json:"claimant"`
	RatingID      uint           `gorm:"column:rating_id" json:"rating_id"`
	Rating        Rating         `gorm:"foreignkey:rating_id;association_foreignkey:id" json:"rating"`
	Review        string         `gorm:"column:review" json:"review"`
	ReviewTagLine string         `gorm:"column:review_tag_line" json:"review_tag_line"`
	ReviewSources string         `gorm:"column:review_sources" json:"review_sources"`
	SpaceID       uint           `gorm:"column:space_id" json:"space_id"`
}

// ClaimsPaging model
type ClaimsPaging struct {
	Nodes []*Claim `json:"nodes"`
	Total int      `json:"total"`
}
