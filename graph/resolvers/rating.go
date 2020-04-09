package resolvers

import (
	"context"
	"errors"
	"log"

	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *ratingResolver) Media(ctx context.Context, obj *models.Rating) (*models.Medium, error) {
	if obj.Media == nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(obj.Media.ID)
}

func (r *queryResolver) Ratings(ctx context.Context, page *int, limit *int, sortBy *string, sortOrder *string) (*models.RatingsPaging, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
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
	cursor, err := mongo.Factcheck.Collection("rating").Find(ctx, query, opts)

	if err != nil {
		log.Fatal(err)
	}

	count, err := mongo.Factcheck.Collection("rating").CountDocuments(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Rating

	for cursor.Next(ctx) {
		var each *models.Rating
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	var result *models.RatingsPaging = new(models.RatingsPaging)

	result.Nodes = nodes
	result.Total = int(count)

	return result, nil
}

// Rating model resolver
func (r *Resolver) Rating() generated.RatingResolver { return &ratingResolver{r} }

type ratingResolver struct{ *Resolver }
