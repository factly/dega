package resolvers

import (
	"context"
	"errors"
	"log"

	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *queryResolver) Statuses(ctx context.Context) (*models.StatusesPaging, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	cursor, err := mongo.Core.Collection("status").Find(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	count, err := mongo.Core.Collection("status").CountDocuments(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Status

	for cursor.Next(ctx) {
		var each *models.Status
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	var result *models.StatusesPaging = new(models.StatusesPaging)

	result.Nodes = nodes
	result.Total = int(count)

	return result, nil
}
