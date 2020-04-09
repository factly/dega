package resolvers

import (
	"context"
	"errors"

	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/mongo"
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

func (r *queryResolver) Organization(ctx context.Context) (*models.Organization, error) {

	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	var result *models.Organization

	err := mongo.Core.Collection("organization").FindOne(ctx, query).Decode(&result)

	if err != nil {
		return nil, nil
	}

	return result, nil
}

// Organization model resolver
func (r *Resolver) Organization() generated.OrganizationResolver { return &organizationResolver{r} }

type organizationResolver struct{ *Resolver }
