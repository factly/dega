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

func (r *ratingResolver) Medium(ctx context.Context, obj *models.Rating) (*models.Medium, error) {
	if obj.MediumID == nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(*obj.MediumID))
}

func (r *queryResolver) Ratings(ctx context.Context, page *int, limit *int, sortBy *string, sortOrder *string) (*models.RatingsPaging, error) {
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

	result := &models.RatingsPaging{}
	result.Nodes = make([]*models.Rating, 0)

	offset, pageLimit := util.Parse(page, limit)

	config.DB.Model(&models.Rating{}).Where(&models.Rating{
		SpaceID: sID,
	}).Count(&result.Total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	return result, nil
}

// Rating model resolver
func (r *Resolver) Rating() generated.RatingResolver { return &ratingResolver{r} }

type ratingResolver struct{ *Resolver }
