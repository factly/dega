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

// BeforeSave - validation for medium
func (rating *Rating) BeforeSave(tx *gorm.DB) (e error) {

	if rating.MediumID > 0 {
		medium := model.Medium{}
		medium.ID = rating.MediumID

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: rating.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return err
		}
	}
	return nil
}
