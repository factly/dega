package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Category model
type Category struct {
	ID              uint            `gorm:"primary_key" json:"id"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	DeletedAt       *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	Name            string          `gorm:"column:name" json:"name"`
	Slug            string          `gorm:"column:slug" json:"slug"`
	Description     postgres.Jsonb  `gorm:"column:description" json:"description"`
	HTMLDescription string          `gorm:"column:html_description" json:"html_description"`
	Medium          *Medium         `json:"medium"`
	ParentID        uint            `gorm:"column:parent_id" json:"parent_id" sql:"DEFAULT:NULL"`
	MediumID        uint            `gorm:"column:medium_id" json:"medium_id" sql:"DEFAULT:NULL"`
	SpaceID         uint            `gorm:"column:space_id" json:"space_id"`
	MetaFields      postgres.Jsonb  `gorm:"column:meta_fields" json:"meta_fields"`
	Meta            postgres.Jsonb  `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode      string          `gorm:"column:header_code" json:"header_code"`
	FooterCode      string          `gorm:"column:footer_code" json:"footer_code"`
}

// CategoriesPaging model
type CategoriesPaging struct {
	Nodes []*Category `json:"nodes"`
	Total int         `json:"total"`
}
