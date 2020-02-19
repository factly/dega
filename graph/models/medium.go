package models

import (
	"time"
)

type Medium struct {
	ID              string    `bson:"_id"`
	Name            string    `bson:"name"`
	Type            string    `bson:"type"`
	URL             string    `bson:"url"`
	FileSize        string    `bson:"file_size"`
	Title           string    `bson:"title"`
	AltText         string    `bson:"alt_text"`
	UploadedBy      string    `bson:"uploaded_by"`
	PublishedDate   time.Time `bson:"published_date"`
	LastUpdatedDate time.Time `bson:"last_updated_date"`
	Slug            *string   `bson:"slug"`
	ClientID        string    `bson:"client_id"`
	CreatedDate     time.Time `bson:"created_date"`
	Class           string    `bson:"_class"`
}
