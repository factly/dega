package model

import (
	"errors"

	"gorm.io/gorm"

	"github.com/factly/dega-server/config"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Category model
type Category struct {
	config.Base
	Name             string         `gorm:"column:name" json:"name"`
	Slug             string         `gorm:"column:slug" json:"slug"`
	BackgroundColour postgres.Jsonb `gorm:"column:background_colour" json:"background_colour" swaggertype:"primitive,string"`
	Description      postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	DescriptionHTML  string         `gorm:"column:description_html" json:"description_html,omitempty"`
	ParentID         *uuid.UUID     `gorm:"type:uuid;column:parent_id;default:NULL" json:"parent_id"`
	ParentCategory   *Category      `gorm:"foreignKey:parent_id" json:"parent_category"`
	MediumID         *uuid.UUID     `gorm:"type:uuid;column:medium_id;default:NULL" json:"medium_id"`
	Medium           *Medium        `gorm:"foreignKey:medium_id" json:"medium"`
	IsFeatured       bool           `gorm:"column:is_featured" json:"is_featured"`
	SpaceID          uuid.UUID      `gorm:"type:uuid;column:space_id" json:"space_id"`
	Posts            []*Post        `gorm:"many2many:post_categories;" json:"posts"`
	MetaFields       postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	Meta             postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `gorm:"column:header_code" json:"header_code"`
	FooterCode       string         `gorm:"column:footer_code" json:"footer_code"`
}

// BeforeSave - validation for medium
func (category *Category) BeforeSave(tx *gorm.DB) (e error) {
	if category.MediumID != nil && *category.MediumID != uuid.Nil {
		medium := Medium{}
		medium.ID = *category.MediumID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: category.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}
	if category.ParentID != nil {
		if *category.ParentID != uuid.Nil {
			category := Category{}
			err := tx.Model(&Category{}).Where(Category{
				SpaceID: category.SpaceID,
			}).First(&category).Error

			if err != nil {
				return errors.New("parent category do not belong to same space")
			}
		}
	}

	return nil
}

// BeforeCreate hook
func (category *Category) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(config.UserContext)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	category.CreatedByID = uID
	category.UpdatedByID = uID
	category.ID = uuid.New()
	return nil
}
