package resolvers

import (
	"context"
	"log"

	"github.com/monarkatfactly/dega-api-go.git/graph/generated"
	"github.com/monarkatfactly/dega-api-go.git/graph/loaders"
	"github.com/monarkatfactly/dega-api-go.git/graph/models"
	"github.com/monarkatfactly/dega-api-go.git/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *ratingResolver) Media(ctx context.Context, obj *models.Rating) (*models.Medium, error) {
	if obj.Media == nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(obj.Media.ID)
}

func (r *queryResolver) Ratings(ctx context.Context) ([]*models.Rating, error) {
	cursor, err := mongo.Factcheck.Collection("rating").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Rating

	for cursor.Next(ctx) {
		var each *models.Rating
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

// Rating model resolver
func (r *Resolver) Rating() generated.RatingResolver { return &ratingResolver{r} }

type ratingResolver struct{ *Resolver }
