package models

import (
	"time"
)

// Status model
type Status struct {
	ID              string    `bson:"_id"`
	Class           string    `bson:"_class"`
	Name            string    `bson:"name"`
	Slug            string    `bson:"slug"`
	ClientID        string    `bson:"client_id"`
	IsDefault       *bool     `bson:"is_default"`
	CreatedDate     time.Time `bson:"created_date"`
	LastUpdatedDate time.Time `bson:"last_updated_date"`
}

// StatusesPaging model
type StatusesPaging struct {
	Nodes []*Status `json:"nodes"`
	Total int       `json:"total"`
}
