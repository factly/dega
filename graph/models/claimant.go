package models

import (
	"time"
)

type Claimant struct {
	ID              string       `bson:"_id"`
	Name            string       `bson:"name"`
	TagLine         string       `bson:"tag_line"`
	Description     string       `bson:"description"`
	ClientID        string       `bson:"client_id"`
	Slug            string       `bson:"slug"`
	CreatedDate     time.Time    `bson:"created_date"`
	LastUpdatedDate time.Time    `bson:"last_updated_date"`
	Media           *DatabaseRef `bson:"media"`
	Class           string       `bson:"_class"`
}
