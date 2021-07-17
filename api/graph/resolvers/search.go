package resolvers

import (
	"context"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/x/meilisearchx"
	"github.com/meilisearch/meilisearch-go"
)

func (r *queryResolver) Search(ctx context.Context, q string) (*models.SearchResult, error) {
	result := models.SearchResult{}
	hits, err := meilisearchx.Client.Search("dega").Search(meilisearch.SearchRequest{
		Query: q,
		Limit: 1000000,
	})
	if err != nil {
		return nil, err
	}

	entityMap := make(map[string][]uint)

	for _, hit := range hits.Hits {
		hitmap := hit.(map[string]interface{})
		id := hitmap["id"].(float64)
		entity := hitmap["kind"].(string)

		entityMap[entity] = append(entityMap[entity], uint(id))
	}

	for key, val := range entityMap {

		switch key {
		case "post":
			config.DB.Model(&models.Post{}).Where(val).Find(&result.Posts)

		case "category":
			config.DB.Model(&models.Category{}).Where(val).Find(&result.Categories)

		case "tag":
			config.DB.Model(&models.Tag{}).Where(val).Find(&result.Tags)

		case "claim":
			config.DB.Model(&models.Claim{}).Where(val).Find(&result.Claims)

		case "claimant":
			config.DB.Model(&models.Claimant{}).Where(val).Find(&result.Claimants)

		case "rating":
			config.DB.Model(&models.Rating{}).Where(val).Find(&result.Ratings)

		case "medium":
			config.DB.Model(&models.Medium{}).Where(val).Find(&result.Media)

		default:
			return nil, nil

		}
	}

	return &result, nil
}
