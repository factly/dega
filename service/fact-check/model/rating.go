package model

import (
	"database/sql"
	"errors"

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
	MediumID     sql.NullInt64 `gorm:"column:medium_id;default=NULL" json:"medium_id"`
	Medium       *model.Medium `json:"medium"`
	SpaceID      uint          `gorm:"column:space_id" json:"space_id"`
}

// BeforeSave - validation for medium
func (rating *Rating) BeforeSave(tx *gorm.DB) (e error) {

	if rating.MediumID.Valid && rating.MediumID.Int64 > 0 {
		medium := model.Medium{}
		medium.ID = uint(rating.MediumID.Int64)

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: rating.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium does not belong to same space")
		}
	}
	return nil
}
