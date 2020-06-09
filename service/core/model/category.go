package model

import (
	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm"
)

// Category model
type Category struct {
	config.Base
	Name        string  `gorm:"column:name" json:"name"`
	Slug        string  `gorm:"column:slug" json:"slug"`
	Description string  `gorm:"column:description" json:"description"`
	ParentID    uint    `gorm:"column:parent_id" json:"parent_id"`
	MediumID    uint    `gorm:"column:medium_id" json:"medium_id" sql:"DEFAULT:NULL"`
	Medium      *Medium `gorm:"foreignkey:medium_id;association_foreignkey:id" json:"medium"`
	SpaceID     uint    `gorm:"column:space_id" json:"space_id"`
}

// BeforeCreate - validation for medium
func (c *Category) BeforeCreate(tx *gorm.DB) (e error) {
	medium := Medium{}
	medium.ID = c.MediumID

	err := tx.Model(&Medium{}).Where(Medium{
		SpaceID: c.SpaceID,
	}).First(&medium).Error

	return err
}
