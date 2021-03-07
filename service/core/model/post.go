package model

import (
	"errors"
	"time"

	"gorm.io/gorm"

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
	Page             bool           `gorm:"column:page" json:"page"`
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
	Space            *Space         `json:"space,omitempty"`
}

// PostAuthor model
type PostAuthor struct {
	config.Base
	AuthorID uint `gorm:"column:author_id" json:"author_id"`
	PostID   uint `gorm:"column:post_id" json:"post_id"`
}

var postUser config.ContextKey = "post_user"

// BeforeSave - validation for associations
func (post *Post) BeforeSave(tx *gorm.DB) (e error) {
	if post.FeaturedMediumID != nil && *post.FeaturedMediumID > 0 {
		medium := Medium{}
		medium.ID = *post.FeaturedMediumID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: post.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}

	if post.FormatID > 0 {
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
	userID := ctx.Value(postUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	post.CreatedByID = uint(uID)
	post.UpdatedByID = uint(uID)
	return nil
}

// BeforeCreate hook
func (pa *PostAuthor) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(postUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	pa.CreatedByID = uint(uID)
	pa.UpdatedByID = uint(uID)
	return nil
}
