package model

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/jinzhu/gorm"
)

// Rating model
type Rating struct {
	config.Base
	Name         string        `gorm:"column:name" json:"name"`
	Slug         string        `gorm:"column:slug" json:"slug"`
	Description  string        `gorm:"column:description" json:"description"`
	NumericValue int           `gorm:"column:numeric_value" json:"numeric_value"`
	MediumID     uint          `gorm:"column:medium_id" json:"medium_id" sql:"DEFAULT:NULL"`
	Medium       *model.Medium `gorm:"foreignkey:medium_id;association_foreignkey:id" json:"medium"`
	SpaceID      uint          `gorm:"column:space_id" json:"space_id"`
}

// BeforeCreate - validation for medium
func (c *Rating) BeforeCreate(tx *gorm.DB) (e error) {
	medium := model.Medium{}
	medium.ID = c.MediumID

	err := tx.Model(&model.Medium{}).Where(model.Medium{
		SpaceID: c.SpaceID,
	}).First(&medium).Error

	return err
}
