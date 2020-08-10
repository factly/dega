package models

import (
	"time"
)

// Author of Factcheck
type Author struct {
	Name  *string `json:"name"`
	Type  string  `json:"type"`
	URL   *string `json:"url"`
	Image *string `json:"image"`
}

// ItemReviewed type
type ItemReviewed struct {
	Type          string    `json:"type"`
	Author        *Author   `json:"author"`
	DatePublished time.Time `json:"datePublished"`
	Name          *string   `json:"name"`
}

// ReviewRating type
type ReviewRating struct {
	Type          string  `json:"type"`
	RatingValue   int     `json:"ratingValue"`
	BestRating    int     `json:"bestRating"`
	WorstRating   int     `json:"worstRating"`
	Image         *string `json:"image"`
	AlternateName string  `json:"alternateName"`
}

// Schemas for factcheck
type Schemas struct {
	Context       *string       `json:"context"`
	Type          string        `json:"type"`
	DatePublished time.Time     `json:"datePublished"`
	URL           *string       `json:"url"`
	Author        *Author       `json:"author"`
	ClaimReviewed string        `json:"claimReviewed"`
	ReviewRating  *ReviewRating `json:"reviewRating"`
	ItemReviewed  *ItemReviewed `json:"itemReviewed"`
}
