package models

import (
	"time"
)

type Post struct {
	ID              string         `bson:"_id"`
	Title           string         `bson:"title"`
	ClientID        string         `bson:"client_id"`
	Content         string         `bson:"content"`
	Excerpt         *string        `bson:"excerpt"`
	PublishedDate   time.Time      `bson:"published_date"`
	LastUpdatedDate time.Time      `bson:"last_updated_date"`
	Featured        bool           `bson:"featured"`
	Sticky          bool           `bson:"sticky"`
	Updates         *string        `bson:"updates"`
	Slug            string         `bson:"slug"`
	CreatedDate     time.Time      `bson:"created_date"`
	Status          DatabaseRef    `bson:"status"`
	Media           *DatabaseRef   `bson:"media"`
	Format          DatabaseRef    `bson:"format"`
	Tags            []*DatabaseRef `bson:"tags"`
	Categories      []*DatabaseRef `bson:"categories"`
	DegaUsers       []*DatabaseRef `bson:"degaUsers"`
	Class           string         `bson:"_class"`
}

type PostsPaging struct {
	Nodes []*Post `json:"nodes"`
	Total int     `json:"total"`
}
