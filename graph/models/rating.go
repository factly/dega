package models

import (
	"time"
)

type Rating struct {
	ID              string       `bson:"_id"`
	Name            string       `bson:"name"`
	NumericValue    int          `bson:"numeric_value"`
	IsDefault       bool         `bson:"is_default"`
	ClientID        string       `bson:"client_id"`
	Slug            string       `bson:"slug"`
	Description     string       `bson:"description"`
	CreatedDate     time.Time    `bson:"created_date"`
	LastUpdatedDate time.Time    `bson:"last_updated_date"`
	Media           *DatabaseRef `bson:"media"`
	Class           string       `bson:"_class"`
}

type RatingsPaging struct {
	Nodes []*Rating `json:"nodes"`
	Total int       `json:"total"`
}
