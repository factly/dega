package models

import (
	"time"
)

// Medium model
type Medium struct {
	ID          int       `json:"id"`
	CreatedDate time.Time `json:"created_date"`
	UpdatedDate time.Time `json:"updated_date"`
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
