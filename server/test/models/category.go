package model

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

type Category struct {
	Base
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	Name             string         `json:"name" validate:"required,max=500"`
	Slug             string         `json:"slug"`
	BackgroundColour postgres.Jsonb `json:"background_colour" validate:"required" swaggertype:"primitive,string"`
	Description      postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	SpaceID          uint           `json:"space_id"`
	ParentID         *uint          `json:"parent_id"`
	MediumID         *uint          `json:"medium_id"`
	IsFeatured       bool           `json:"is_featured"`
	MetaFields       postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta             postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `json:"header_code"`
	FooterCode       string         `json:"footer_code"`
	Medium           *Medium        `json:"medium"`
}
