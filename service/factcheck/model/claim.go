package model

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Claim model
type Claim struct {
	config.Base
	Claim         string         `gorm:"column:claim" json:"claim"`
	Slug          string         `gorm:"column:slug" json:"slug"`
	ClaimDate     time.Time      `gorm:"column:claim_date" json:"claim_date"`
	CheckedDate   time.Time      `gorm:"column:checked_date" json:"checked_date"`
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
