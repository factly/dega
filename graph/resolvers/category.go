package resolvers

import (
	"context"
	"log"

	"github.com/monarkatfactly/dega-api-go.git/graph/models"
	"github.com/monarkatfactly/dega-api-go.git/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *queryResolver) Categories(ctx context.Context) ([]*models.Category, error) {
	cursor, err := mongo.Core.Collection("category").Find(ctx, bson.D{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Category

	for cursor.Next(ctx) {
		var each *models.Category
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}
	return results, nil
}
