package models

import "time"

type Sitemap struct {
	Slug        string    `bson:"slug"`
	ID          string    `bson:"_id"`
	CreatedDate time.Time `bson:"created_date"`
}

type Sitemaps string
