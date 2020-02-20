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

func (r *factcheckResolver) Claims(ctx context.Context, obj *models.Factcheck) ([]*models.Claim, error) {
	if len(obj.Claims) == 0 {
		return nil, nil
	}

	var allClaimID []string

	for _, claim := range obj.Claims {
		allClaimID = append(allClaimID, claim.ID)
	}

	claims, _ := loaders.GetClaimLoader(ctx).LoadAll(allClaimID)
	return claims, nil
}

func (r *factcheckResolver) Status(ctx context.Context, obj *models.Factcheck) (*models.Status, error) {
	return loaders.GetStatusLoader(ctx).Load(obj.Status.ID)
}

func (r *factcheckResolver) Media(ctx context.Context, obj *models.Factcheck) (*models.Medium, error) {
	if obj.Media == nil {
		return nil, nil
	}
	return loaders.GetMediumLoader(ctx).Load(obj.Media.ID)
}

func (r *factcheckResolver) Categories(ctx context.Context, obj *models.Factcheck) ([]*models.Category, error) {
	if len(obj.Categories) == 0 {
		return nil, nil
	}

	var allCategoryID []string

	for _, category := range obj.Categories {
		allCategoryID = append(allCategoryID, category.ID)
	}

	categories, _ := loaders.GetCategoryLoader(ctx).LoadAll(allCategoryID)
	return categories, nil
}

func (r *factcheckResolver) Tags(ctx context.Context, obj *models.Factcheck) ([]*models.Tag, error) {
	if len(obj.Tags) == 0 {
		return nil, nil
	}

	var allTagID []string

	for _, tag := range obj.Tags {
		allTagID = append(allTagID, tag.ID)
	}

	tags, _ := loaders.GetTagLoader(ctx).LoadAll(allTagID)
	return tags, nil
}

func (r *factcheckResolver) DegaUsers(ctx context.Context, obj *models.Factcheck) ([]*models.User, error) {
	if len(obj.DegaUsers) == 0 {
		return nil, nil
	}

	var allUserID []string

	for _, user := range obj.DegaUsers {
		allUserID = append(allUserID, user.ID)
	}

	users, _ := loaders.GetUserLoader(ctx).LoadAll(allUserID)
	return users, nil
}

func (r *queryResolver) Factchecks(ctx context.Context) ([]*models.Factcheck, error) {
	cursor, err := mongo.Factcheck.Collection("factcheck").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Factcheck

	for cursor.Next(ctx) {
		var each *models.Factcheck
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

// Factcheck model resolver
func (r *Resolver) Factcheck() generated.FactcheckResolver { return &factcheckResolver{r} }

type factcheckResolver struct{ *Resolver }
