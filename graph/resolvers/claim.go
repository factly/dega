package resolvers

import (
	"context"
	"fmt"
	"strings"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
	"github.com/factly/dega-api/util/cache"
)

func (r *claimResolver) ID(ctx context.Context, obj *models.Claim) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *claimResolver) SpaceID(ctx context.Context, obj *models.Claim) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *claimResolver) Description(ctx context.Context, obj *models.Claim) (interface{}, error) {
	return obj.Description, nil
}

func (r *claimResolver) HTMLDescription(ctx context.Context, obj *models.Claim) (*string, error) {
	return &obj.HTMLDescription, nil
}

func (r *claimResolver) ClaimSources(ctx context.Context, obj *models.Claim) (interface{}, error) {
	return obj.ClaimSources, nil
}

func (r *claimResolver) Fact(ctx context.Context, obj *models.Claim) (string, error) {
	return obj.Fact, nil
}

func (r *claimResolver) ReviewSources(ctx context.Context, obj *models.Claim) (interface{}, error) {
	return obj.ReviewSources, nil
}

func (r *claimResolver) Rating(ctx context.Context, obj *models.Claim) (*models.Rating, error) {
	return loaders.GetRatingLoader(ctx).Load(fmt.Sprint(obj.RatingID))
}

func (r *claimResolver) Claimant(ctx context.Context, obj *models.Claim) (*models.Claimant, error) {
	return loaders.GetClaimantLoader(ctx).Load(fmt.Sprint(obj.ClaimantID))
}

func (r *queryResolver) Claims(ctx context.Context, spaces []int, ratings []int, claimants []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.ClaimsPaging, error) {
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

	result := &models.ClaimsPaging{}
	result.Nodes = make([]*models.Claim, 0)

	offset, pageLimit := util.Parse(page, limit)

	tx := config.DB.Model(&models.Claim{})

	filterStr := ""

	if len(ratings) > 0 {
		filterStr = filterStr + fmt.Sprint("claims.rating_id IN (", strings.Trim(strings.Replace(fmt.Sprint(ratings), " ", ",", -1), "[]"), ") AND ")
	}

	if len(claimants) > 0 {
		filterStr = filterStr + fmt.Sprint("claims.claimant_id IN (", strings.Trim(strings.Replace(fmt.Sprint(claimants), " ", ",", -1), "[]"), ") AND ")
	}

	filterStr = strings.Trim(filterStr, " AND")

	var total int64
	tx.Where(&models.Claim{
		SpaceID: uint(sID),
	}).Where(filterStr).Count(&total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	if cache.IsEnabled() {
		if err = cache.SaveToCache(ctx, result); err != nil {
			return result, nil
		}
	}

	return result, nil
}

// Claim model resolver
func (r *Resolver) Claim() generated.ClaimResolver { return &claimResolver{r} }

type claimResolver struct{ *Resolver }
