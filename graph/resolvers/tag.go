package resolvers

import (
	"context"
	"log"

	"github.com/monarkatfactly/dega-api-go.git/graph/models"
	"github.com/monarkatfactly/dega-api-go.git/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *queryResolver) Tags(ctx context.Context) ([]*models.Tag, error) {
	cursor, err := mongo.Core.Collection("tag").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Tag

	for cursor.Next(ctx) {
		var each *models.Tag
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}
