package config

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ContextKey keys for contexts
type ContextKey string

// Base with id, created_at, updated_at & deleted_at
type Base struct {
	ID          uuid.UUID       `gorm:"type:uuid;primary_key" json:"id"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	DeletedAt   *gorm.DeletedAt `sql:"index" json:"deleted_at" swaggertype:"primitive,string"`
	CreatedByID string          `gorm:"column:created_by_id" json:"created_by_id"`
	UpdatedByID string          `gorm:"column:updated_by_id" json:"updated_by_id"`
}
