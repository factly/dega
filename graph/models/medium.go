package models

import (
	"time"
)

// Medium model
type Medium struct {
	ID          int       `json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Name        string    `json:"name"`
	Slug        *string   `json:"slug"`
	Type        string    `json:"type"`
	Title       string    `json:"title"`
	Description *string   `json:"description"`
	Caption     *string   `json:"caption"`
	FileSize    string    `json:"file_size"`
	AltText     string    `json:"alt_text"`
	URL         string    `json:"url"`
	Dimensions  string    `json:"dimensions"`
	SpaceID     int       `json:"space_id"`
}
