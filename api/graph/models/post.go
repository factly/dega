package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Post model
type Post struct {
	ID               uuid.UUID       `gorm:"primary_key" json:"id"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	DeletedAt        *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	Title            string          `gorm:"column:title" json:"title"`
	Subtitle         string          `gorm:"column:subtitle" json:"subtitle"`
	Slug             string          `gorm:"column:slug" json:"slug"`
	Status           string          `gorm:"column:status" json:"status"`
	Excerpt          string          `gorm:"column:excerpt" json:"excerpt"`
	Description      postgres.Jsonb  `gorm:"column:description" json:"description" sql:"jsonb"`
	DescriptionHTML  string          `gorm:"column:description_html" json:"description_html"`
	IsPage           bool            `gorm:"column:is_page" json:"is_page"`
	IsFeatured       bool            `gorm:"column:is_featured" json:"is_featured"`
	IsSticky         bool            `gorm:"column:is_sticky" json:"is_sticky"`
	IsHighlighted    bool            `gorm:"column:is_highlighted" json:"is_highlighted"`
	FeaturedMediumID uuid.UUID       `gorm:"column:featured_medium_id" json:"featured_medium_id" sql:"DEFAULT:NULL"`
	FormatID         uuid.UUID       `gorm:"column:format_id" json:"format_id" sql:"DEFAULT:NULL"`
	PublishedDate    *time.Time      `gorm:"column:published_date" json:"published_date"`
	Schemas          postgres.Jsonb  `gorm:"column:schemas" json:"schemas"`
	Meta             postgres.Jsonb  `gorm:"column:meta" json:"meta"`
	HeaderCode       string          `gorm:"column:header_code" json:"header_code"`
	FooterCode       string          `gorm:"column:footer_code" json:"footer_code"`
	MetaFields       postgres.Jsonb  `gorm:"column:meta_fields" json:"meta_fields"`
	Tags             []Tag           `gorm:"many2many:post_tags;" json:"tags,omitempty"`
	Categories       []Category      `gorm:"many2many:post_categories;" json:"categories,omitempty"`
	Format           *Format         `gorm:"foreignKey:format_id" json:"format,omitempty"`
	Medium           *Medium         `gorm:"foreignKey:featured_medium_id" json:"medium,omitempty"`
	SpaceID          uuid.UUID       `gorm:"column:space_id" json:"space_id"`
	Language         string          `gorm:"column:language" json:"language"`
	CustomFormat     string          `gorm:"column:custom_format" json:"custom_format"`
}

// PostsPaging model
type PostsPaging struct {
	Nodes []*Post `json:"nodes"`
	Total int     `json:"total"`
}

// PostTag model
type PostTag struct {
	TagID  uuid.UUID `gorm:"column:tag_id" json:"tag_id"`
	PostID uuid.UUID `gorm:"column:post_id" json:"post_id"`
}

// PostCategory model
type PostCategory struct {
	CategoryID uuid.UUID `gorm:"column:category_id" json:"category_id"`
	PostID     uuid.UUID `gorm:"column:post_id" json:"post_id"`
}

// PostAuthor model
type PostAuthor struct {
	AuthorID string    `gorm:"column:author_id" json:"author_id"`
	PostID   uuid.UUID `gorm:"column:post_id" json:"post_id"`
}

// PostClaim model
type PostClaim struct {
	ID        uuid.UUID       `gorm:"primary_key" json:"id"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
	DeletedAt *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	ClaimID   uuid.UUID       `gorm:"column:claim_id" json:"claim_id"`
	PostID    uuid.UUID       `gorm:"column:post_id" json:"post_id"`
	Position  int             `gorm:"column:position" json:"position"`
	Claim     *Claim          `json:"claim"`
}
