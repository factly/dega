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
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (r *claimResolver) Rating(ctx context.Context, obj *models.Claim) (*models.Rating, error) {
	return loaders.GetRatingLoader(ctx).Load(obj.Rating.ID)
}

func (r *claimResolver) Claimant(ctx context.Context, obj *models.Claim) (*models.Claimant, error) {
	return loaders.GetClaimantLoader(ctx).Load(obj.Claimant.ID)
}

func (r *queryResolver) Claims(ctx context.Context, ratings []string, claimants []string) ([]*models.Claim, error) {

	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	if len(ratings) > 0 {
		keys := []primitive.ObjectID{}

		for _, id := range ratings {
			rid, err := primitive.ObjectIDFromHex(id)

			if err == nil {
				keys = append(keys, rid)
			}
		}

		query["rating.$id"] = bson.M{"$in": keys}
	}

	if len(claimants) > 0 {
		keys := []primitive.ObjectID{}

		for _, id := range claimants {
			cid, err := primitive.ObjectIDFromHex(id)

			if err == nil {
				keys = append(keys, cid)
			}
		}

		query["claimant.$id"] = bson.M{"$in": keys}
	}

	cursor, err := mongo.Factcheck.Collection("claim").Find(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Claim

	for cursor.Next(ctx) {
		var each *models.Claim
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

// Claim model resolver
func (r *Resolver) Claim() generated.ClaimResolver { return &claimResolver{r} }

type claimResolver struct{ *Resolver }
