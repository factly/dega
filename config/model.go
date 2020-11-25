package config

import (
	"time"

	"gorm.io/gorm"
)

// ContextKey keys for contexts
type ContextKey string

// Base with id, created_at, updated_at & deleted_at
type Base struct {
	ID        uint            `gorm:"primary_key" json:"id"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
	DeletedAt *gorm.DeletedAt `sql:"index" json:"deleted_at" swaggertype:"primitive,string"`
	CreatedBy uint            `gorm:"column:created_by" json:"created_by"`
	UpdatedBy uint            `gorm:"column:updated_by" json:"updated_by"`
}
