package post

import (
	"encoding/json"
	"fmt"
	"time"

	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/fact-check/model"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// ArticleSchema for article
type ArticleSchema struct {
	Context       string     `json:"@context"`
	Type          string     `json:"@type"`
	Headline      string     `json:"headline"`
	Image         []Image    `json:"image,omitempty"`
	DatePublished *time.Time `json:"datePublished"`
	Author        []Author   `json:"author"`
	Publisher     Publisher  `json:"publisher"`
}

// Image for article
type Image struct {
	Type string `json:"@type"`
	URL  string `json:"url"`
}

// Author of article
type Author struct {
	Name string `json:"name"`
	Type string `json:"@type"`
	URL  string `json:"url"`
}

// Publisher for article
type Publisher struct {
	Type string `json:"@type"`
	Name string `json:"name"`
	Logo Image  `json:"logo,omitempty"`
}

// FactCheckSchema for factcheck
type FactCheckSchema struct {
	Context       string       `json:"@context"`
	Type          string       `json:"@type"`
	DatePublished time.Time    `json:"datePublished"`
	URL           string       `json:"url"`
	ClaimReviewed string       `json:"claimReviewed"`
	Author        Author       `json:"author"`
	ReviewRating  ReviewRating `json:"reviewRating"`
	ItemReviewed  ItemReviewed `json:"itemReviewed"`
}

// ReviewRating type
type ReviewRating struct {
	Type              string `json:"@type"`
	RatingValue       int    `json:"ratingValue"`
	BestRating        int    `json:"bestRating"`
	WorstRating       int    `json:"worstRating"`
	AlternateName     string `json:"alternateName"`
	RatingExplanation string `json:"ratingExplanation"`
}

// ItemReviewed type
type ItemReviewed struct {
	Type          string         `json:"@type"`
	DatePublished time.Time      `json:"datePublished"`
	Appearance    postgres.Jsonb `json:"appearance"`
	Author        Author         `json:"author"`
}

type PostData struct {
	Post    Post
	Authors []PostAuthor
	Claims  []Claim
}

type Post struct {
	Title         string
	Slug          string
	PublishedDate *time.Time
	CreatedAt     time.Time
}

type PostAuthor struct {
	DisplayName string
	ID          string
}

type Claim struct {
	Claim        string
	Fact         string
	Slug         string
	Rating       model.Rating
	CheckedDate  *time.Time
	Claimant     model.Claimant
	ClaimSources postgres.Jsonb
}

func GetArticleSchema(obj PostData, space coreModel.Space) ArticleSchema {
	jsonLogo := map[string]string{}
	if space.Logo != nil {
		rawLogo, _ := space.Logo.URL.RawMessage.MarshalJSON()
		_ = json.Unmarshal(rawLogo, &jsonLogo)
	}

	articleSchema := ArticleSchema{}
	articleSchema.Context = "https://schema.org"
	articleSchema.Type = "NewsArticle"
	articleSchema.Headline = obj.Post.Title
	if _, ok := jsonLogo["raw"]; ok {
		articleSchema.Image = append(articleSchema.Image, Image{
			Type: "ImageObject",
			URL:  jsonLogo["raw"]})
	}
	articleSchema.DatePublished = obj.Post.PublishedDate
	for _, eachAuthor := range obj.Authors {
		articleSchema.Author = append(articleSchema.Author, Author{
			Type: "Person",
			Name: eachAuthor.DisplayName,
			URL:  fmt.Sprint(space.SiteAddress, "/users/", eachAuthor.ID),
		})
	}
	articleSchema.Publisher.Type = "Organization"
	articleSchema.Publisher.Name = space.Name
	if _, ok := jsonLogo["raw"]; ok {
		articleSchema.Publisher.Logo.Type = "ImageObject"
		articleSchema.Publisher.Logo.URL = jsonLogo["raw"]
	}

	return articleSchema
}

func GetFactCheckSchema(obj PostData, space coreModel.Space) []FactCheckSchema {
	result := make([]FactCheckSchema, 0)

	bestRating := 5
	worstRating := 1
	//TODO: Implement this when less are more than 2
	// if len(ratings) > 2 {
	// 	bestRating = ratings[len(ratings)-1].NumericValue
	// 	worstRating = ratings[0].NumericValue
	// }

	for _, each := range obj.Claims {
		claimSchema := FactCheckSchema{}
		claimSchema.Context = "https://schema.org"
		claimSchema.Type = "ClaimReview"
		claimSchema.DatePublished = obj.Post.CreatedAt
		claimSchema.URL = space.SiteAddress + "/" + obj.Post.Slug
		claimSchema.ClaimReviewed = each.Claim
		claimSchema.Author.Type = "Organization"
		claimSchema.Author.Name = space.Name
		claimSchema.Author.URL = space.SiteAddress
		claimSchema.ReviewRating.Type = "Rating"
		claimSchema.ReviewRating.RatingValue = each.Rating.NumericValue
		claimSchema.ReviewRating.AlternateName = each.Rating.Name
		claimSchema.ReviewRating.BestRating = bestRating
		claimSchema.ReviewRating.RatingExplanation = each.Fact
		claimSchema.ReviewRating.WorstRating = worstRating
		claimSchema.ItemReviewed.Type = "Claim"
		if each.CheckedDate != nil {
			claimSchema.ItemReviewed.DatePublished = *each.CheckedDate
		}
		claimSchema.ItemReviewed.Appearance = each.ClaimSources
		claimSchema.ItemReviewed.Author.Type = "Organization"
		claimSchema.ItemReviewed.Author.Name = each.Claimant.Name

		result = append(result, claimSchema)
	}
	return result
}

func GetSchemas(obj PostData, space coreModel.Space) []interface{} {
	schemas := make([]interface{}, 0)

	schemas = append(schemas, GetArticleSchema(obj, space))

	factCheckSchemas := GetFactCheckSchema(obj, space)

	for _, each := range factCheckSchemas {
		schemas = append(schemas, each)
	}

	return schemas
}
