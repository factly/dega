package models

import (
	"time"
)

// Category model
type Category struct {
	ID              string    `bson:"_id"`
	Class           string    `bson:"_class"`
	Name            string    `bson:"name"`
	Slug            string    `bson:"slug"`
	ClientID        string    `bson:"client_id"`
	CreatedDate     time.Time `bson:"created_date"`
	Description     *string   `bson:"description"`
	LastUpdatedDate time.Time `bson:"last_updated_date"`
}

// CategoriesPaging model
type CategoriesPaging struct {
	Nodes []*Category `json:"nodes"`
	Total int         `json:"total"`
}
