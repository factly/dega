package models

import (
	"time"
)

// Author of Factcheck
type Author struct {
	Name string  `json:"name"`
	Type string  `json:"@type"`
	URL  *string `json:"url"`
}

// ItemReviewed type
type ItemReviewed struct {
	Type          string    `json:"@type"`
	DatePublished time.Time `json:"datePublished"`
	Appearance    string    `json:"appearance"`
	Author        Author    `json:"author"`
}

// ReviewRating type
type ReviewRating struct {
	Type          string `json:"@type"`
	RatingValue   int    `json:"ratingValue"`
	BestRating    *int   `json:"bestRating"`
	WorstRating   *int   `json:"worstRating"`
	AlternateName string `json:"alternateName"`
}

// Schemas for factcheck
type Schemas struct {
	Context       string       `json:"@context"`
	Type          string       `json:"@type"`
	DatePublished time.Time    `json:"datePublished"`
	URL           string       `json:"url"`
	ClaimReviewed string       `json:"claimReviewed"`
	Author        Author       `json:"author"`
	ReviewRating  ReviewRating `json:"reviewRating"`
	ItemReviewed  ItemReviewed `json:"itemReviewed"`
}
