package models

import (
	"time"
)

type Tag struct {
	ID              string    `bson:"_id"`
	Class           string    `bson:"_class"`
	Name            string    `bson:"name"`
	Slug            string    `bson:"slug"`
	ClientID        string    `bson:"client_id"`
	CreatedDate     time.Time `bson:"created_date"`
	LastUpdatedDate time.Time `bson:"last_updated_date"`
}

type TagsPaging struct {
	Nodes []*Tag `json:"nodes"`
	Total int    `json:"total"`
}
