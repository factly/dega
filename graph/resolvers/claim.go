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
)

func (r *claimResolver) Description(ctx context.Context, obj *models.Claim) (interface{}, error) {

	return obj.Description, nil
}

func (r *claimResolver) Rating(ctx context.Context, obj *models.Claim) (*models.Rating, error) {
	return loaders.GetRatingLoader(ctx).Load(fmt.Sprint(obj.RatingID))
}

func (r *claimResolver) Claimant(ctx context.Context, obj *models.Claim) (*models.Claimant, error) {
	return loaders.GetClaimantLoader(ctx).Load(fmt.Sprint(obj.ClaimantID))
}

func (r *queryResolver) Claims(ctx context.Context, ratings []int, claimants []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.ClaimsPaging, error) {
	columns := []string{"created_at", "updated_at", "name", "slug"}
	order := "created_at desc"
	pageSortBy := "created_at"
	pageSortOrder := "desc"

	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	if sortOrder != nil && *sortOrder == "asc" {
		pageSortOrder = "asc"
	}

	if sortBy != nil && util.ColumnValidator(*sortBy, columns) {
		pageSortBy = *sortBy
	}

	order = pageSortBy + " " + pageSortOrder

	result := &models.ClaimsPaging{}
	result.Nodes = make([]*models.Claim, 0)

	offset, pageLimit := util.Parse(page, limit)

	tx := config.DB.Model(&models.Claim{}).Where(&models.Claim{
		SpaceID: sID,
	})

	filterStr := ""

	if len(ratings) > 0 {
		filterStr = filterStr + fmt.Sprint("claims.rating_id IN ( ", strings.Trim(strings.Replace(fmt.Sprint(ratings), " ", ",", -1), "[]"), ") AND ")
	}

	if len(claimants) > 0 {
		filterStr = filterStr + fmt.Sprint("claims.claimant_id IN ( ", strings.Trim(strings.Replace(fmt.Sprint(claimants), " ", ",", -1), "[]"), ") AND ")
	}

	filterStr = strings.Trim(filterStr, " AND ")

	tx.Where(filterStr).Count(&result.Total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	return result, nil
}

// Claim model resolver
func (r *Resolver) Claim() generated.ClaimResolver { return &claimResolver{r} }

type claimResolver struct{ *Resolver }
