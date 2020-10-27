package model

import (
	"database/sql"
	"errors"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/jinzhu/gorm"
)

// Claimant model
type Claimant struct {
	config.Base
	Name        string        `gorm:"column:name" json:"name"`
	Slug        string        `gorm:"column:slug" json:"slug"`
	Description string        `gorm:"column:description" json:"description"`
	TagLine     string        `gorm:"column:tag_line" json:"tag_line"`
	MediumID    sql.NullInt64 `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium      *model.Medium `json:"medium"`
	SpaceID     uint          `gorm:"column:space_id" json:"space_id"`
}

// BeforeSave - validation for medium
func (claimant *Claimant) BeforeSave(tx *gorm.DB) (e error) {
	if claimant.MediumID.Valid && claimant.MediumID.Int64 > 0 {
		medium := model.Medium{}
		medium.ID = uint(claimant.MediumID.Int64)

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: claimant.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}

	return nil
}
