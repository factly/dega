package model

import (
	"errors"

	"gorm.io/gorm"

	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Category model
type Category struct {
	config.Base
	Name        string         `gorm:"column:name" json:"name"`
	Slug        string         `gorm:"column:slug" json:"slug"`
	Description postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	ParentID    *uint          `gorm:"column:parent_id;default:NULL" json:"parent_id"`
	MediumID    *uint          `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium      *Medium        `json:"medium"`
	IsFeatured  bool           `gorm:"column:is_featured" json:"is_featured"`
	SpaceID     uint           `gorm:"column:space_id" json:"space_id"`
	Posts       []*Post        `gorm:"many2many:post_categories;" json:"posts"`
	Space       *Space         `json:"space,omitempty"`
}

// BeforeSave - validation for medium
func (category *Category) BeforeSave(tx *gorm.DB) (e error) {
	if category.MediumID != nil && *category.MediumID > 0 {
		medium := Medium{}
		medium.ID = *category.MediumID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: category.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}

	return nil
}

var categoryUser config.ContextKey = "category_user"

// BeforeCreate hook
func (category *Category) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(categoryUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	category.CreatedByID = uint(uID)
	category.UpdatedByID = uint(uID)
	return nil
}
