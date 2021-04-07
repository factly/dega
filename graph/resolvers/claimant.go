package resolvers

import (
	"context"
	"fmt"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/util"
)

func (r *claimantResolver) ID(ctx context.Context, obj *models.Claimant) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *claimantResolver) SpaceID(ctx context.Context, obj *models.Claimant) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *claimantResolver) Description(ctx context.Context, obj *models.Claimant) (interface{}, error) {
	return obj.Description, nil
}

func (r *claimantResolver) HTMLDescription(ctx context.Context, obj *models.Claimant) (*string, error) {
	return &obj.HTMLDescription, nil
}

func (r *claimantResolver) Medium(ctx context.Context, obj *models.Claimant) (*models.Medium, error) {
	if obj.MediumID == 0 {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.MediumID))
}

func (r *queryResolver) Claimants(ctx context.Context, spaces []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.ClaimantsPaging, error) {
	result := &models.ClaimantsPaging{}
	result.Nodes = make([]*models.Claimant, 0)

	offset, pageLimit := util.Parse(page, limit)

	tx := config.DB.Model(&models.Claimant{})

	if len(spaces) > 0 {
		tx.Where("space_id IN (?)", spaces)
	}

	var total int64
	tx.Count(&total).Order("id desc").Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	return result, nil
}

// Claimant model resolver
func (r *Resolver) Claimant() generated.ClaimantResolver { return &claimantResolver{r} }

type claimantResolver struct{ *Resolver }
