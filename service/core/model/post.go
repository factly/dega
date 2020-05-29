package model

import (
	"time"

	"github.com/factly/dega-server/config"
)

// Post model
type Post struct {
	config.Base
	Title            string    `gorm:"column:title" json:"title"`
	Subtitle         string    `gorm:"column:subtitle" json:"subtitle"`
	Slug             string    `gorm:"column:slug" json:"slug"`
	Status           string    `gorm:"column:status" json:"status"`
	Excerpt          string    `gorm:"column:excerpt" json:"excerpt"`
	Description      string    `gorm:"column:description" json:"description"`
	Updates          string    `gorm:"column:updates" json:"updates"`
	IsFeatured       bool      `gorm:"column:is_featured" json:"is_featured"`
	IsSticky         bool      `gorm:"column:is_sticky" json:"is_sticky"`
	IsHighlighted    bool      `gorm:"column:is_highlighted" json:"is_highlighted"`
	FeaturedMediumID uint      `gorm:"column:featured_medium_id" json:"featured_medium_id" sql:"DEFAULT:NULL"`
	FormatID         uint      `gorm:"column:format_id" json:"format_id"`
	Format           Format    `gorm:"foreignkey:format_id;association_foreignkey:id" json:"format"`
	PublishedDate    time.Time `gorm:"column:published_date" json:"published_date"`
	Medium           *Medium   `gorm:"foreignkey:featured_medium_id;association_foreignkey:id" json:"medium"`
	SpaceID          uint      `gorm:"column:space_id" json:"space_id"`
}

// PostTag model
type PostTag struct {
	config.Base
	TagID  uint `gorm:"column:tag_id" json:"tag_id"`
	Tag    Tag  `gorm:"foreignkey:tag_id;association_foreignkey:id"`
	PostID uint `gorm:"column:factcheck_id" json:"factcheck_id"`
}

// PostCategory model
type PostCategory struct {
	config.Base
	CategoryID uint     `gorm:"column:category_id" json:"category_id"`
	Category   Category `gorm:"foreignkey:category_id;association_foreignkey:id"`
	PostID     uint     `gorm:"column:factcheck_id" json:"factcheck_id"`
}
