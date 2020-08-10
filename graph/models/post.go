package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// Post model
type Post struct {
	ID               int            `json:"id"`
	CreatedDate      time.Time      `json:"created_date"`
	UpdatedDate      time.Time      `json:"updated_date"`
	Title            string         `json:"title"`
	Subtitle         *string        `json:"subtitle"`
	Slug             string         `json:"slug"`
	Status           string         `json:"status"`
	Excerpt          *string        `json:"excerpt"`
	Description      postgres.Jsonb `json:"description"`
	IsFeatured       *bool          `json:"is_featured"`
	IsSticky         *bool          `json:"is_sticky"`
	IsHighlighted    *bool          `json:"is_highlighted"`
	SpaceID          int            `json:"space_id"`
	FormatID         int            `json:"format_id"`
	FeaturedMediumID int            `json:"featured_medium_id"`
}

// PostsPaging model
type PostsPaging struct {
	Nodes []*Post `json:"nodes"`
	Total int     `json:"total"`
}

// PostTag model
type PostTag struct {
	ID          int       `json:"id"`
	CreatedDate time.Time `json:"created_date"`
	UpdatedDate time.Time `json:"updated_date"`
	TagID       int       `json:"tag_id"`
	PostID      int       `gorm:"column:post_id" json:"post_id"`
}

// PostCategory model
type PostCategory struct {
	ID          int       `json:"id"`
	CreatedDate time.Time `json:"created_date"`
	UpdatedDate time.Time `json:"updated_date"`
	CategoryID  int       `json:"category_id"`
	PostID      int       `json:"post_id"`
}

// PostAuthor model
type PostAuthor struct {
	ID          int       `json:"id"`
	CreatedDate time.Time `json:"created_date"`
	UpdatedDate time.Time `json:"updated_date"`
	AuthorID    int       `json:"author_id"`
	PostID      int       `json:"post_id"`
}

// PostClaim model
type PostClaim struct {
	ID          int       `json:"id"`
	CreatedDate time.Time `json:"created_date"`
	UpdatedDate time.Time `json:"updated_date"`
	ClaimID     int       `json:"claim_id"`
	PostID      int       `gorm:"column:post_id" json:"post_id"`
}
