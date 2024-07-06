package model

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Webhook webhook model
type Webhook struct {
	config.Base
	Name    string            `json:"name"`
	URL     string            `json:"url"`
	Enabled bool              `json:"enabled"`
	Events  []Event           `json:"events"`
	Tags    map[string]string `json:"tags"`
}

// Event event model
type Event struct {
	config.Base
	Name  string            `json:"name"`
	Event string            `json:"event"`
	Tags  map[string]string `json:"tags"`
}

// WebhookLog model
type WebhookLog struct {
	ID                 uuid.UUID      `gorm:"primary_key" json:"id"`
	CreatedAt          time.Time      `json:"created_at"`
	CreatedByID        uint           `gorm:"column:created_by_id" json:"created_by_id"`
	Event              string         `gorm:"column:event" json:"event"`
	URL                string         `gorm:"column:url" json:"url"`
	ResponseStatusCode int            `gorm:"column:response_status_code" json:"response_status_code"`
	Data               postgres.Jsonb `gorm:"column:data" json:"data" swaggertype:"primitive,string"`
	ResponseBody       postgres.Jsonb `gorm:"column:response_body" json:"response_body" swaggertype:"primitive,string"`
	Tags               postgres.Jsonb `gorm:"column:tags" json:"tags" swaggertype:"primitive,string"`
}
