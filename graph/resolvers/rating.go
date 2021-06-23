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

func (r *ratingResolver) ID(ctx context.Context, obj *models.Rating) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *ratingResolver) SpaceID(ctx context.Context, obj *models.Rating) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *ratingResolver) Description(ctx context.Context, obj *models.Rating) (interface{}, error) {
	return obj.Description, nil
}

func (r *ratingResolver) BackgroundColour(ctx context.Context, obj *models.Rating) (interface{}, error) {
	return obj.BackgroundColour, nil
}

func (r *ratingResolver) TextColour(ctx context.Context, obj *models.Rating) (interface{}, error) {
	return obj.TextColour, nil
}

func (r *ratingResolver) HTMLDescription(ctx context.Context, obj *models.Rating) (*string, error) {
	return &obj.HTMLDescription, nil
}

func (r *ratingResolver) Medium(ctx context.Context, obj *models.Rating) (*models.Medium, error) {
	if obj.MediumID == 0 {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.MediumID))
}

func (r *queryResolver) Ratings(ctx context.Context, spaces []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.RatingsPaging, error) {
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

	result := &models.RatingsPaging{}
	result.Nodes = make([]*models.Rating, 0)

	offset, pageLimit := util.Parse(page, limit)

	tx := config.DB.Model(&models.Rating{})

	var total int64
	tx.Where(&models.Rating{
		SpaceID: uint(sID),
	}).Preload("Medium").Count(&total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	return result, nil
}

// Rating model resolver
func (r *Resolver) Rating() generated.RatingResolver { return &ratingResolver{r} }

type ratingResolver struct{ *Resolver }
