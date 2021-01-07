package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// Menu model
type Menu struct {
	ID        uint           `gorm:"primary_key" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	Name      string         `gorm:"column:name" json:"name"`
	Slug      string         `gorm:"column:slug" json:"slug"`
	Menu      postgres.Jsonb `gorm:"column:menu" json:"menu"`
	SpaceID   uint           `gorm:"column:space_id" json:"space_id"`
}

// MenusPaging model
type MenusPaging struct {
	Nodes []*Menu `json:"nodes"`
	Total int     `json:"total"`
}
