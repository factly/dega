package resolvers

import (
	"context"
	"errors"

	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/logger"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *userResolver) Media(ctx context.Context, obj *models.User) (*models.Medium, error) {
	if obj.Media == nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(obj.Media.ID)
}

func (r *queryResolver) Users(ctx context.Context, page *int, limit *int, sortBy *string, sortOrder *string) (*models.UsersPaging, error) {

	query := bson.M{}

	pageLimit := 10
	pageNo := 1
	pageSortBy := "created_date"
	pageSortOrder := -1

	if limit != nil && *limit > 0 && *limit <= 20 {
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
	cursor, err := mongo.Core.Collection("dega_user").Find(ctx, query, opts)

	if err != nil {
		logger.Error(err)
		return nil, nil
	}

	count, err := mongo.Core.Collection("dega_user").CountDocuments(ctx, query)

	if err != nil {
		logger.Error(err)
		return nil, nil
	}

	var nodes []*models.User

	for cursor.Next(ctx) {
		var each *models.User
		err := cursor.Decode(&each)
		if err != nil {
			logger.Error(err)
			return nil, nil
		}
		nodes = append(nodes, each)
	}

	var result *models.UsersPaging = new(models.UsersPaging)

	result.Nodes = nodes
	result.Total = int(count)

	return result, nil
}

func (r *queryResolver) User(ctx context.Context, id string) (*models.User, error) {

	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	oid, err := primitive.ObjectIDFromHex(id)

	if err != nil {
		return nil, nil
	}

	query := bson.M{
		"_id": oid,
	}

	var result *models.User

	err = mongo.Core.Collection("dega_user").FindOne(ctx, query).Decode(&result)

	if err != nil {
		return nil, nil
	}

	return result, nil
}

// User model resolver
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type userResolver struct{ *Resolver }
