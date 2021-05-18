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

func (r *formatResolver) ID(ctx context.Context, obj *models.Format) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *formatResolver) SpaceID(ctx context.Context, obj *models.Format) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *queryResolver) Formats(ctx context.Context, spaces []int) (*models.FormatsPaging, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}
	result := &models.FormatsPaging{}
	result.Nodes = make([]*models.Format, 0)

	tx := config.DB.Model(&models.Format{})

	var total int64
	tx.Where(&models.Format{
		SpaceID: uint(sID),
	}).Count(&total).Order("id desc").Find(&result.Nodes)

	result.Total = int(total)

	if err = cache.SaveToCache(ctx, result); err != nil {
		return result, nil
	}

	return result, nil
}

// Format model resolver
func (r *Resolver) Format() generated.FormatResolver { return &formatResolver{r} }

type formatResolver struct{ *Resolver }
