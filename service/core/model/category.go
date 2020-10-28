package model

import (
	"database/sql"
	"errors"

	"gorm.io/gorm"

	"github.com/factly/dega-server/config"
)

// Category model
type Category struct {
	config.Base
	Name        string        `gorm:"column:name" json:"name"`
	Slug        string        `gorm:"column:slug" json:"slug"`
	Description string        `gorm:"column:description" json:"description"`
	ParentID    sql.NullInt64 `gorm:"column:parent_id;default:NULL" json:"parent_id"`
	MediumID    sql.NullInt64 `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium      *Medium       `json:"medium"`
	IsFeatured  bool          `gorm:"column:is_featured" json:"is_featured"`
	SpaceID     uint          `gorm:"column:space_id" json:"space_id"`
	Posts       []*Post       `gorm:"many2many:post_categories;" json:"posts"`
	Space       *Space        `json:"space"`
}

// BeforeSave - validation for medium
func (category *Category) BeforeSave(tx *gorm.DB) (e error) {
	if category.MediumID.Valid && category.MediumID.Int64 > 0 {
		medium := Medium{}
		medium.ID = uint(category.MediumID.Int64)

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: category.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}

	return nil
}
