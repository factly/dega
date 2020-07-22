package resolvers

import (
	"context"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
)

func (r *queryResolver) Media(ctx context.Context) ([]*models.Medium, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := []*models.Medium{}

	config.DB.Model(&models.Medium{}).Where(&models.Medium{
		SpaceID: sID,
	}).Find(&result)

	return result, nil
}
