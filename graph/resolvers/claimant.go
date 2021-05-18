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
	"github.com/factly/dega-api/util/cache"
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
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}
	columns := []string{"created_at", "updated_at", "name", "slug"}
	pageSortBy := "created_at"
	pageSortOrder := "desc"

	if sortOrder != nil && *sortOrder == "asc" {
		pageSortOrder = "asc"
	}

	if sortBy != nil && util.ColumnValidator(*sortBy, columns) {
		pageSortBy = *sortBy
	}

	order := pageSortBy + " " + pageSortOrder

	result := &models.ClaimantsPaging{}
	result.Nodes = make([]*models.Claimant, 0)

	offset, pageLimit := util.Parse(page, limit)

	tx := config.DB.Model(&models.Claimant{})

	var total int64
	tx.Where(&models.Claimant{
		SpaceID: uint(sID),
	}).Count(&total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	if err = cache.SaveToCache(ctx, result); err != nil {
		return result, nil
	}

	return result, nil
}

// Claimant model resolver
func (r *Resolver) Claimant() generated.ClaimantResolver { return &claimantResolver{r} }

type claimantResolver struct{ *Resolver }
