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

func (r *organizationResolver) MediaLogo(ctx context.Context, obj *models.Organization) (*models.Medium, error) {
	if obj.MediaLogo == nil {
		return nil, nil
	}
	return loaders.GetMediumLoader(ctx).Load(obj.MediaLogo.ID)
}

func (r *organizationResolver) MediaMobileLogo(ctx context.Context, obj *models.Organization) (*models.Medium, error) {
	if obj.MediaMobileLogo == nil {
		return nil, nil
	}
	return loaders.GetMediumLoader(ctx).Load(obj.MediaMobileLogo.ID)
}

func (r *organizationResolver) MediaFavicon(ctx context.Context, obj *models.Organization) (*models.Medium, error) {
	if obj.MediaFavicon == nil {
		return nil, nil
	}
	return loaders.GetMediumLoader(ctx).Load(obj.MediaFavicon.ID)
}

func (r *organizationResolver) MediaMobileIcon(ctx context.Context, obj *models.Organization) (*models.Medium, error) {
	if obj.MediaMobileIcon == nil {
		return nil, nil
	}
	return loaders.GetMediumLoader(ctx).Load(obj.MediaMobileIcon.ID)
}

func (r *queryResolver) Organizations(ctx context.Context) ([]*models.Organization, error) {
	cursor, err := mongo.Core.Collection("organization").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Organization

	for cursor.Next(ctx) {
		var each *models.Organization
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

// Organization model resolver
func (r *Resolver) Organization() generated.OrganizationResolver { return &organizationResolver{r} }

type organizationResolver struct{ *Resolver }
