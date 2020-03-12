package models

import "time"

// Sitemap model
type Sitemap struct {
	Slug        string    `bson:"slug"`
	ID          string    `bson:"_id"`
	CreatedDate time.Time `bson:"created_date"`
}

// Sitemaps model
type Sitemaps string
