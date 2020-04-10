package resolvers

import (
	"context"
	"errors"

	"github.com/factly/dega-api/graph/logger"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *queryResolver) Formats(ctx context.Context) (*models.FormatsPaging, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	cursor, err := mongo.Core.Collection("format").Find(ctx, query)

	if err != nil {
		logger.Error(err)
		return nil, nil
	}

	count, err := mongo.Core.Collection("format").CountDocuments(ctx, query)

	if err != nil {
		logger.Error(err)
		return nil, nil
	}

	var nodes []*models.Format

	for cursor.Next(ctx) {
		var each *models.Format
		err := cursor.Decode(&each)
		if err != nil {
			logger.Error(err)
			return nil, nil
		}
		nodes = append(nodes, each)
	}

	var result *models.FormatsPaging = new(models.FormatsPaging)

	result.Nodes = nodes
	result.Total = int(count)

	return result, nil
}
