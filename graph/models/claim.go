package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Claim model
type Claim struct {
	ID              uint            `gorm:"primary_key" json:"id"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	DeletedAt       *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	Claim           string          `gorm:"column:claim" json:"claim"`
	Slug            string          `gorm:"column:slug" json:"slug"`
	ClaimDate       time.Time       `gorm:"column:claim_date" json:"claim_date" sql:"DEFAULT:NULL"`
	CheckedDate     time.Time       `gorm:"column:checked_date" json:"checked_date" sql:"DEFAULT:NULL"`
	ClaimSources    postgres.Jsonb  `gorm:"column:claim_sources" json:"claim_sources"`
	Description     postgres.Jsonb  `gorm:"column:description" json:"description"`
	HTMLDescription string          `gorm:"column:html_description" json:"html_description"`
	ClaimantID      uint            `gorm:"column:claimant_id" json:"claimant_id"`
	Claimant        Claimant        `gorm:"foreignkey:claimant_id;association_foreignkey:id" json:"claimant"`
	RatingID        uint            `gorm:"column:rating_id" json:"rating_id"`
	Rating          Rating          `gorm:"foreignkey:rating_id;association_foreignkey:id" json:"rating"`
	Fact            string          `gorm:"column:fact" json:"fact"`
	ReviewSources   postgres.Jsonb  `gorm:"column:review_sources" json:"review_sources"`
	SpaceID         uint            `gorm:"column:space_id" json:"space_id"`
}

// ClaimsPaging model
type ClaimsPaging struct {
	Nodes []*Claim `json:"nodes"`
	Total int      `json:"total"`
}
