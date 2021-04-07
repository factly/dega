package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Rating model
type Rating struct {
	ID               uint            `gorm:"primary_key" json:"id"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	DeletedAt        *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	Name             string          `gorm:"column:name" json:"name"`
	Slug             string          `gorm:"column:slug" json:"slug"`
	Description      postgres.Jsonb  `gorm:"column:description" json:"description"`
	BackgroundColour postgres.Jsonb  `gorm:"column:background_colour" json:"background_colour" swaggertype:"primitive,string"`
	TextColour       postgres.Jsonb  `gorm:"column:text_colour" json:"text_colour" swaggertype:"primitive,string"`
	HTMLDescription  string          `gorm:"column:html_description" json:"html_description"`
	NumericValue     int             `gorm:"column:numeric_value" json:"numeric_value"`
	MediumID         uint            `gorm:"column:medium_id" json:"medium_id" sql:"DEFAULT:NULL"`
	SpaceID          uint            `gorm:"column:space_id" json:"space_id"`
}

// RatingsPaging model
type RatingsPaging struct {
	Nodes []*Rating `json:"nodes"`
	Total int       `json:"total"`
}
