package model

import (
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/factly/dega-server/config"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Post model
type Post struct {
	config.Base
	Title            string         `gorm:"column:title" json:"title"`
	Subtitle         string         `gorm:"column:subtitle" json:"subtitle"`
	Slug             string         `gorm:"column:slug" json:"slug"`
	Status           string         `gorm:"column:status" json:"status"`
	IsPage           bool           `gorm:"column:is_page" json:"is_page"`
	Excerpt          string         `gorm:"column:excerpt" json:"excerpt"`
	Description      postgres.Jsonb `gorm:"column:description" json:"description" sql:"jsonb" swaggertype:"primitive,string"`
	DescriptionHTML  string         `gorm:"column:description_html" json:"description_html,omitempty"`
	IsFeatured       bool           `gorm:"column:is_featured" json:"is_featured"`
	IsSticky         bool           `gorm:"column:is_sticky" json:"is_sticky"`
	IsHighlighted    bool           `gorm:"column:is_highlighted" json:"is_highlighted"`
	FeaturedMediumID *uuid.UUID     `gorm:"type:uuid;column:featured_medium_id;default:NULL" json:"featured_medium_id"`
	Medium           *Medium        `gorm:"foreignKey:featured_medium_id" json:"medium"`
	FormatID         uuid.UUID      `gorm:"type:uuid;column:format_id" json:"format_id" sql:"DEFAULT:NULL"`
	Format           *Format        `gorm:"foreignKey:format_id" json:"format"`
	Language         string         `gorm:"column:language" json:"language"`
	PublishedDate    *time.Time     `gorm:"column:published_date" json:"published_date"`
	SpaceID          uuid.UUID      `gorm:"type:uuid;column:space_id" json:"space_id"`
	Schemas          postgres.Jsonb `gorm:"column:schemas" json:"schemas" swaggertype:"primitive,string"`
	Meta             postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `gorm:"column:header_code" json:"header_code"`
	FooterCode       string         `gorm:"column:footer_code" json:"footer_code"`
	DescriptionAMP   string         `gorm:"column:description_amp" json:"description_amp"`
	MigrationID      uuid.UUID      `gorm:"type:uuid;column:migration_id;default:NULL;" json:"migration_id"`
	MigratedHTML     string         `gorm:"column:migrated_html" json:"migrated_html"`
	MetaFields       postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	Tags             []Tag          `gorm:"many2many:post_tags;" json:"tags"`
	Categories       []Category     `gorm:"many2many:post_categories;" json:"categories"`
	CustomFormat     string         `gorm:"column:custom_format" json:"custom_format"`
}

// PostAuthor model
type PostAuthor struct {
	config.Base
	AuthorID string    `gorm:"column:author_id" json:"author_id"`
	PostID   uuid.UUID `gorm:"type:uuid;column:post_id" json:"post_id"`
}

// BeforeSave - validation for associations
func (post *Post) BeforeSave(tx *gorm.DB) (e error) {
	if post.FeaturedMediumID != nil && *post.FeaturedMediumID != uuid.Nil {
		medium := Medium{}
		medium.ID = *post.FeaturedMediumID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: post.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}

	if post.FormatID != uuid.Nil {
		format := Format{}
		format.ID = post.FormatID

		err := tx.Model(&Format{}).Where(Format{
			SpaceID: post.SpaceID,
		}).First(&format).Error

		if err != nil {
			return errors.New("format do not belong to same space")
		}
	}

	for _, tag := range post.Tags {
		if tag.SpaceID != post.SpaceID {
			return errors.New("some tags do not belong to same space")
		}
	}

	for _, category := range post.Categories {
		if category.SpaceID != post.SpaceID {
			return errors.New("some categories do not belong to same space")
		}
	}

	return nil
}

// BeforeCreate hook
func (post *Post) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(config.UserContext)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	post.CreatedByID = uID
	post.UpdatedByID = uID
	post.ID = uuid.New()
	return nil
}

// BeforeCreate hook
func (pa *PostAuthor) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(config.UserContext)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	pa.CreatedByID = uID
	pa.UpdatedByID = uID
	pa.ID = uuid.New()
	return nil
}
