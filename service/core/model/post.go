package model

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Post model
type Post struct {
	config.Base
	Title            string         `gorm:"column:title" json:"title"`
	Subtitle         string         `gorm:"column:subtitle" json:"subtitle"`
	Slug             string         `gorm:"column:slug" json:"slug"`
	Status           string         `gorm:"column:status" json:"status"`
	Excerpt          string         `gorm:"column:excerpt" json:"excerpt"`
	Description      postgres.Jsonb `gorm:"column:description" json:"description" sql:"jsonb"`
	IsFeatured       bool           `gorm:"column:is_featured" json:"is_featured"`
	IsSticky         bool           `gorm:"column:is_sticky" json:"is_sticky"`
	IsHighlighted    bool           `gorm:"column:is_highlighted" json:"is_highlighted"`
	FeaturedMediumID uint           `gorm:"column:featured_medium_id" json:"featured_medium_id" sql:"DEFAULT:NULL"`
	Medium           *Medium        `gorm:"foreignkey:featured_medium_id;association_foreignkey:id" json:"medium"`
	FormatID         uint           `gorm:"column:format_id" json:"format_id" sql:"DEFAULT:NULL"`
	Format           *Format        `gorm:"foreignkey:format_id;association_foreignkey:id" json:"format"`
	PublishedDate    time.Time      `gorm:"column:published_date" json:"published_date"`
	SpaceID          uint           `gorm:"column:space_id" json:"space_id"`
	Tags             []Tag          `gorm:"many2many:post_tags;" json:"tags"`
}

// PostCategory model
type PostCategory struct {
	config.Base
	CategoryID uint     `gorm:"column:category_id" json:"category_id"`
	Category   Category `gorm:"foreignkey:category_id;association_foreignkey:id"`
	PostID     uint     `gorm:"column:post_id" json:"post_id"`
}

// PostAuthor model
type PostAuthor struct {
	config.Base
	AuthorID uint `gorm:"column:author_id" json:"author_id"`
	PostID   uint `gorm:"column:post_id" json:"post_id"`
}
