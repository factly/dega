package resolvers

import (
	"context"
	"errors"
	"log"

	"github.com/monarkatfactly/dega-api-go.git/graph/generated"
	"github.com/monarkatfactly/dega-api-go.git/graph/loaders"
	"github.com/monarkatfactly/dega-api-go.git/graph/models"
	"github.com/monarkatfactly/dega-api-go.git/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *claimantResolver) Media(ctx context.Context, obj *models.Claimant) (*models.Medium, error) {
	if obj.Media == nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(obj.Media.ID)
}

func (r *queryResolver) Claimants(ctx context.Context, page *int, limit *int) ([]*models.Claimant, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	pageLimit := 10
	pageNo := 1
	if limit != nil {
		pageLimit = *limit
	}
	if page != nil {
		pageNo = *page
	}

	opts := options.Find().SetSkip(int64((pageNo - 1) * pageLimit)).SetLimit(int64(pageLimit))
	cursor, err := mongo.Factcheck.Collection("claimant").Find(ctx, query, opts)

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Claimant

	for cursor.Next(ctx) {
		var each *models.Claimant
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

// Claimant model resolver
func (r *Resolver) Claimant() generated.ClaimantResolver { return &claimantResolver{r} }

type claimantResolver struct{ *Resolver }
