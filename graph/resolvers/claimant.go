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

func (r *claimantResolver) Medium(ctx context.Context, obj *models.Claimant) (*models.Medium, error) {
	if obj.MediumID == nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(*obj.MediumID))
}

func (r *queryResolver) Claimants(ctx context.Context, page *int, limit *int, sortBy *string, sortOrder *string) (*models.ClaimantsPaging, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.ClaimantsPaging{}
	result.Nodes = make([]*models.Claimant, 0)

	offset, pageLimit := util.Parse(page, limit)

	config.DB.Model(&models.Claimant{}).Where(&models.Claimant{
		SpaceID: sID,
	}).Count(&result.Total).Order("id desc").Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	return result, nil
}

// Claimant model resolver
func (r *Resolver) Claimant() generated.ClaimantResolver { return &claimantResolver{r} }

type claimantResolver struct{ *Resolver }
