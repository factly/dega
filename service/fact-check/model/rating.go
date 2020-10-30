package model

import (
	"errors"

	"gorm.io/gorm"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

// Rating model
type Rating struct {
	config.Base
	Name         string        `gorm:"column:name" json:"name"`
	Slug         string        `gorm:"column:slug" json:"slug"`
	Description  string        `gorm:"column:description" json:"description"`
	NumericValue int           `gorm:"column:numeric_value" json:"numeric_value"`
	MediumID     *uint         `gorm:"column:medium_id;default=NULL" json:"medium_id"`
	Medium       *model.Medium `json:"medium"`
	SpaceID      uint          `gorm:"column:space_id" json:"space_id"`
	Space        *model.Space  `json:"space,omitempty"`
}

// BeforeSave - validation for medium
func (rating *Rating) BeforeSave(tx *gorm.DB) (e error) {

	if rating.MediumID != nil && *rating.MediumID > 0 {
		medium := model.Medium{}
		medium.ID = *rating.MediumID

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: rating.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium does not belong to same space")
		}
	}
	return nil
}
