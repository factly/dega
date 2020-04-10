package resolvers

import (
	"context"
	"errors"

	"github.com/factly/dega-api/graph/logger"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *queryResolver) Tags(ctx context.Context, ids []string, page *int, limit *int, sortBy *string, sortOrder *string) (*models.TagsPaging, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	if len(ids) > 0 {
		keys := []primitive.ObjectID{}

		for _, id := range ids {
			rid, err := primitive.ObjectIDFromHex(id)

			if err == nil {
				keys = append(keys, rid)
			}
		}

		query["_id"] = bson.M{"$in": keys}
	}

	pageLimit := 10
	pageNo := 1
	pageSortBy := "created_date"
	pageSortOrder := -1

	if limit != nil {
		pageLimit = *limit
	}
	if page != nil {
		pageNo = *page
	}

	if sortBy != nil {
		pageSortBy = *sortBy
	}
	if sortOrder != nil && *sortOrder == "ASC" {
		pageSortOrder = 1
	}

	opts := options.Find().SetSort(bson.D{{pageSortBy, pageSortOrder}}).SetSkip(int64((pageNo - 1) * pageLimit)).SetLimit(int64(pageLimit))
	cursor, err := mongo.Core.Collection("tag").Find(ctx, query, opts)

	if err != nil {
		logger.Error(err)
		return nil, nil
	}

	count, err := mongo.Core.Collection("tag").CountDocuments(ctx, query)

	if err != nil {
		logger.Error(err)
		return nil, nil
	}

	var nodes []*models.Tag

	for cursor.Next(ctx) {
		var each *models.Tag
		err := cursor.Decode(&each)
		if err != nil {
			logger.Error(err)
			return nil, nil
		}
		nodes = append(nodes, each)
	}

	var result *models.TagsPaging = new(models.TagsPaging)

	result.Nodes = nodes
	result.Total = int(count)

	return result, nil
}

func (r *queryResolver) Tag(ctx context.Context, id string) (*models.Tag, error) {

	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	oid, err := primitive.ObjectIDFromHex(id)

	if err != nil {
		return nil, nil
	}

	query := bson.M{
		"client_id": client,
		"_id":       oid,
	}

	var result *models.Tag

	err = mongo.Core.Collection("tag").FindOne(ctx, query).Decode(&result)

	if err != nil {
		return nil, nil
	}

	return result, nil
}
