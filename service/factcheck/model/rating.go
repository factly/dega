package model

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

// Rating model
type Rating struct {
	config.Base
	Name         string       `gorm:"column:name" json:"name"`
	Slug         string       `gorm:"column:slug" json:"slug"`
	Description  string       `gorm:"column:description" json:"description"`
	NumericValue string       `gorm:"column:numeric_value" json:"numeric_value"`
	MediumID     uint         `gorm:"column:medium_id" json:"medium_id"`
	Medium       model.Medium `gorm:"foreignkey:medium_id;association_foreignkey:id" json:"medium"`
}
