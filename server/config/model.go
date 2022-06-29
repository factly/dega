package config

import (
	"time"

	"gorm.io/gorm"
)

// ContextKey keys for contexts
type ContextKey string

// Base with id, created_at, updated_at & deleted_at
type Base struct {
	ID          uint            `gorm:"primaryKey;type:INT4;default:nextval('id_sequence');" json:"id"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	DeletedAt   *gorm.DeletedAt `sql:"index" json:"deleted_at" swaggertype:"primitive,string"`
	CreatedByID uint            `gorm:"column:created_by_id" json:"created_by_id"`
	UpdatedByID uint            `gorm:"column:updated_by_id" json:"updated_by_id"`
}
