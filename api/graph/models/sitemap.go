package models

import "time"

// Sitemap model
type Sitemap struct {
	Slug      string    `json:"slug"`
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
}

// Sitemaps model
type Sitemaps string
