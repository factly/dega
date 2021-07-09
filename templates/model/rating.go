package model

import "github.com/jinzhu/gorm/dialects/postgres"

// Rating rating model
type Rating struct {
	Base
	Name         string         `gorm:"column:name" json:"name"`
	Slug         string         `gorm:"column:slug" json:"slug"`
	Colour       postgres.Jsonb `gorm:"column:colour" json:"colour" swaggertype:"primitive,string"`
	Description  postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	NumericValue int            `gorm:"column:numeric_value" json:"numeric_value"`
	MediumID     *uint          `gorm:"column:medium_id;default=NULL" json:"medium_id"`
	Medium       *Medium        `json:"medium"`
	SpaceID      uint           `gorm:"column:space_id" json:"space_id"`
}
