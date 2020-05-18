package model

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

// Claimant model
type Claimant struct {
	config.Base
	Name        string       `gorm:"column:name" json:"name"`
	Slug        string       `gorm:"column:slug" json:"slug"`
	Description string       `gorm:"column:description" json:"description"`
	TagLine     string       `gorm:"column:tag_line" json:"tag_line"`
	MediumID    uint         `gorm:"column:medium_id" json:"medium_id"`
	Medium      model.Medium `gorm:"foreignkey:medium_id;association_foreignkey:id" json:"medium"`
}
