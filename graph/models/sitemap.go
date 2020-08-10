package models

import "time"

// Sitemap model
type Sitemap struct {
	Slug        string    `json:"slug"`
	ID          string    `json:"id"`
	CreatedDate time.Time `json:"created_date"`
}

// Sitemaps model
type Sitemaps string
