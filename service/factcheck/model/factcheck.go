package model

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

// Factcheck model
type Factcheck struct {
	config.Base
	Title            string       `gorm:"column:title" json:"title"`
	Subtitle         string       `gorm:"column:subtitle" json:"subtitle"`
	Slug             string       `gorm:"column:slug" json:"slug"`
	Status           string       `gorm:"column:status" json:"status"`
	Excerpt          string       `gorm:"column:excerpt" json:"excerpt"`
	Description      string       `gorm:"column:description" json:"description"`
	Updates          string       `gorm:"column:updates" json:"updates"`
	IsFeatured       bool         `gorm:"column:is_featured" json:"is_featured"`
	IsSticky         bool         `gorm:"column:is_sticky" json:"is_sticky"`
	IsHighlighted    bool         `gorm:"column:is_highlighted" json:"is_highlighted"`
	FeaturedMediumID uint         `gorm:"column:featured_medium_id" json:"featured_medium_id"`
	PublishedDate    time.Time    `gorm:"column:published_date" json:"published_date"`
	Medium           model.Medium `gorm:"foreignkey:featured_medium_id;association_foreignkey:id" json:"medium"`
	SpaceID          uint         `gorm:"column:space_id" json:"space_id"`
}

// FactcheckTag model
type FactcheckTag struct {
	config.Base
	TagID       uint      `gorm:"column:tag_id" json:"tag_id" validate:"required"`
	Tag         model.Tag `gorm:"foreignkey:tag_id;association_foreignkey:id"`
	FactcheckID uint      `gorm:"column:factcheck_id" json:"factcheck_id" validate:"required"`
}

// FactcheckCategory model
type FactcheckCategory struct {
	config.Base
	CategoryID  uint           `gorm:"column:category_id" json:"category_id" validate:"required"`
	Category    model.Category `gorm:"foreignkey:category_id;association_foreignkey:id"`
	FactcheckID uint           `gorm:"column:factcheck_id" json:"factcheck_id" validate:"required"`
}

// FactcheckClaim model
type FactcheckClaim struct {
	config.Base
	ClaimID     uint  `gorm:"column:claim_id" json:"claim_id" validate:"required"`
	Claim       Claim `gorm:"foreignkey:claim_id;association_foreignkey:id"`
	FactcheckID uint  `gorm:"column:factcheck_id" json:"factcheck_id" validate:"required"`
}
