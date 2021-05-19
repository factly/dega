package resolvers

import (
	"context"
	"fmt"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util/cache"
)

func (r *mediumResolver) ID(ctx context.Context, obj *models.Medium) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *mediumResolver) SpaceID(ctx context.Context, obj *models.Medium) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *mediumResolver) URL(ctx context.Context, obj *models.Medium) (interface{}, error) {
	return obj.URL, nil
}

func (r *queryResolver) Media(ctx context.Context) ([]*models.Medium, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := []*models.Medium{}

	config.DB.Model(&models.Medium{}).Where(&models.Medium{
		SpaceID: sID,
	}).Find(&result)

	if cache.IsEnabled() {
		if err = cache.SaveToCache(ctx, result); err != nil {
			return result, nil
		}
	}

	return result, nil
}

// Medium model resolver
func (r *Resolver) Medium() generated.MediumResolver { return &mediumResolver{r} }

type mediumResolver struct{ *Resolver }
