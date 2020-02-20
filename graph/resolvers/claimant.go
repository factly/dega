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

func (r *claimantResolver) Media(ctx context.Context, obj *models.Claimant) (*models.Medium, error) {
	if obj.Media == nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(obj.Media.ID)
}

func (r *queryResolver) Claimnats(ctx context.Context) ([]*models.Claimant, error) {
	cursor, err := mongo.Factcheck.Collection("claimnat").Find(ctx, bson.M{})

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
