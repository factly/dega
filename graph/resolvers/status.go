package resolvers

import (
	"context"
	"log"

	"github.com/monarkatfactly/dega-api-go.git/graph/models"
	"github.com/monarkatfactly/dega-api-go.git/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *queryResolver) Statuses(ctx context.Context) ([]*models.Status, error) {
	cursor, err := mongo.Core.Collection("status").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Status

	for cursor.Next(ctx) {
		var each *models.Status
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}
