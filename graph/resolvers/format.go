package resolvers

import (
	"context"
	"fmt"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
)

func (r *formatResolver) ID(ctx context.Context, obj *models.Format) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *formatResolver) SpaceID(ctx context.Context, obj *models.Format) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *queryResolver) Formats(ctx context.Context) (*models.FormatsPaging, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.FormatsPaging{}
	result.Nodes = make([]*models.Format, 0)

	config.DB.Model(&models.Format{}).Where(&models.Format{
		SpaceID: sID,
	}).Count(&result.Total).Order("id desc").Find(&result.Nodes)

	return result, nil
}

// Format model resolver
func (r *Resolver) Format() generated.FormatResolver { return &formatResolver{r} }

type formatResolver struct{ *Resolver }
