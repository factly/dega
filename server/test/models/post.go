package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// post request body
type Post struct {
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	Title            string         `json:"title" validate:"required,max=500"`
	Subtitle         string         `json:"subtitle"`
	Slug             string         `json:"slug"`
	Excerpt          string         `json:"excerpt"`
	Description      postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	Status           string         `json:"status"`
	IsPage           bool           `json:"is_page"`
	IsFeatured       bool           `json:"is_featured"`
	IsSticky         bool           `json:"is_sticky"`
	IsHighlighted    bool           `json:"is_highlighted"`
	FeaturedMediumID uint           `json:"featured_medium_id"`
	PublishedDate    *time.Time     `json:"published_date"`
	FormatID         uint           `json:"format_id" validate:"required"`
	SpaceID          uint           `json:"space_id"`
	Meta             postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `json:"header_code"`
	FooterCode       string         `json:"footer_code"`
	MetaFields       postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	DescriptionAMP   string         `json:"description_amp"`
	MigrationID      *uint          `json:"migration_id"`
	MigratedHTML     string         `json:"migrated_html"`
	CategoryIDs      []uint         `json:"category_ids"`
	TagIDs           []uint         `json:"tag_ids"`
	ClaimIDs         []uint         `json:"claim_ids"`
	AuthorIDs        []uint         `json:"author_ids"`
}
