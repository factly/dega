package resolvers

import (
	"context"
	"fmt"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
)

func (r *claimantResolver) ID(ctx context.Context, obj *models.Claimant) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *claimantResolver) SpaceID(ctx context.Context, obj *models.Claimant) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *claimantResolver) Medium(ctx context.Context, obj *models.Claimant) (*models.Medium, error) {
	if obj.MediumID == 0 {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.MediumID))
}

func (r *queryResolver) Claimants(ctx context.Context, page *int, limit *int, sortBy *string, sortOrder *string) (*models.ClaimantsPaging, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.ClaimantsPaging{}
	result.Nodes = make([]*models.Claimant, 0)

	offset, pageLimit := util.Parse(page, limit)

	var total int64
	config.DB.Model(&models.Claimant{}).Where(&models.Claimant{
		SpaceID: sID,
	}).Count(&total).Order("id desc").Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	return result, nil
}

// Claimant model resolver
func (r *Resolver) Claimant() generated.ClaimantResolver { return &claimantResolver{r} }

type claimantResolver struct{ *Resolver }
