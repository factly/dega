package model

import (
	"errors"

	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm"
)

// Category model
type Category struct {
	config.Base
	Name        string  `gorm:"column:name" json:"name"`
	Slug        string  `gorm:"column:slug" json:"slug"`
	Description string  `gorm:"column:description" json:"description"`
	ParentID    uint    `gorm:"column:parent_id" json:"parent_id" sql:"DEFAULT:NULL"`
	MediumID    uint    `gorm:"column:medium_id" json:"medium_id" sql:"DEFAULT:NULL"`
	Medium      *Medium `json:"medium"`
	IsFeatured  bool    `gorm:"column:is_featured" json:"is_featured"`
	SpaceID     uint    `gorm:"column:space_id;foreignKey:space_id;references:spaces(id)" json:"space_id"`
	Posts       []*Post `gorm:"many2many:post_categories;" json:"posts"`
}

// BeforeSave - validation for medium
func (category *Category) BeforeSave(tx *gorm.DB) (e error) {
	if category.MediumID > 0 {
		medium := Medium{}
		medium.ID = category.MediumID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: category.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}

	return nil
}
