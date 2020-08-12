package model

import (
	"errors"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm"
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
	Categories       []Category     `gorm:"many2many:post_categories;" json:"categories"`
}

// PostAuthor model
type PostAuthor struct {
	config.Base
	AuthorID uint `gorm:"column:author_id" json:"author_id"`
	PostID   uint `gorm:"column:post_id" json:"post_id"`
}

// BeforeSave - validation for associations
func (p *Post) BeforeSave(tx *gorm.DB) (e error) {
	if p.FeaturedMediumID > 0 {
		medium := Medium{}
		medium.ID = p.FeaturedMediumID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: p.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return err
		}
	}

	if p.FormatID > 0 {
		format := Format{}
		format.ID = p.FormatID

		err := tx.Model(&Format{}).Where(Format{
			SpaceID: p.SpaceID,
		}).First(&format).Error

		if err != nil {
			return err
		}
	}

	for _, t := range p.Tags {
		if t.SpaceID != p.SpaceID {
			return errors.New("some tags do not belong to same space")
		}
	}

	for _, c := range p.Categories {
		if c.SpaceID != p.SpaceID {
			return errors.New("some categories do not belong to same space")
		}
	}

	return nil
}
