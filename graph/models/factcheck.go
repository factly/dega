package models

import (
	"time"
)

// Factcheck model
type Factcheck struct {
	ID              string         `bson:"_id"`
	Title           string         `bson:"title"`
	ClientID        string         `bson:"client_id"`
	Introduction    string         `bson:"introduction"`
	Summary         string         `bson:"summary"`
	Excerpt         *string        `bson:"excerpt"`
	LastUpdatedDate time.Time      `bson:"last_updated_date"`
	Featured        bool           `bson:"featured"`
	Sticky          bool           `bson:"sticky"`
	Updates         *string        `bson:"updates"`
	Slug            string         `bson:"slug"`
	SubTitle        *string        `bson:"sub_title"`
	CreatedDate     time.Time      `bson:"created_date"`
	PublishedDate   time.Time      `bson:"published_date"`
	Claims          []*DatabaseRef `bson:"claims"`
	Status          DatabaseRef    `bson:"status"`
	Media           *DatabaseRef   `bson:"media"`
	Categories      []*DatabaseRef `bson:"categories"`
	Tags            []*DatabaseRef `bson:"tags"`
	DegaUsers       []*DatabaseRef `bson:"degaUsers"`
	Class           string         `bson:"_class"`
}

// FactchecksPaging model
type FactchecksPaging struct {
	Nodes []*Factcheck `json:"nodes"`
	Total int          `json:"total"`
}
