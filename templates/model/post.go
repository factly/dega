package model

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// Post model
type Post struct {
	Base
	Title            string         `gorm:"column:title" json:"title"`
	Subtitle         string         `gorm:"column:subtitle" json:"subtitle"`
	Slug             string         `gorm:"column:slug" json:"slug"`
	Status           string         `gorm:"column:status" json:"status"`
	Excerpt          string         `gorm:"column:excerpt" json:"excerpt"`
	Description      postgres.Jsonb `gorm:"column:description" json:"description" sql:"jsonb" swaggertype:"primitive,string"`
	IsFeatured       bool           `gorm:"column:is_featured" json:"is_featured"`
	IsSticky         bool           `gorm:"column:is_sticky" json:"is_sticky"`
	IsHighlighted    bool           `gorm:"column:is_highlighted" json:"is_highlighted"`
	FeaturedMediumID *uint          `gorm:"column:featured_medium_id;default:NULL" json:"featured_medium_id"`
	Medium           *Medium        `gorm:"foreignKey:featured_medium_id" json:"medium"`
	FormatID         uint           `gorm:"column:format_id" json:"format_id" sql:"DEFAULT:NULL"`
	Format           *Format        `json:"format"`
	PublishedDate    time.Time      `gorm:"column:published_date" json:"published_date"`
	SpaceID          uint           `gorm:"column:space_id" json:"space_id"`
	Tags             []Tag          `gorm:"many2many:post_tags;" json:"tags"`
	Categories       []Category     `gorm:"many2many:post_categories;" json:"categories"`
}

// PostAuthor model
type PostAuthor struct {
	Base
	AuthorID uint `gorm:"column:author_id" json:"author_id"`
	PostID   uint `gorm:"column:post_id" json:"post_id"`
}
