package models

import "time"

// Sitemap model
type Sitemap struct {
	Slug        string    `json:"slug"`
	ID          string    `json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	PublishedAt time.Time `json:"published_at"`
}

// Sitemaps model
type Sitemaps string
