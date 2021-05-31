package resolvers

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
	"github.com/factly/dega-api/util/cache"
)

func (r *tagResolver) ID(ctx context.Context, obj *models.Tag) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *tagResolver) SpaceID(ctx context.Context, obj *models.Tag) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *tagResolver) HTMLDescription(ctx context.Context, obj *models.Tag) (*string, error) {
	return &obj.HTMLDescription, nil
}
func (r *queryResolver) Tag(ctx context.Context, id int) (*models.Tag, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.Tag{}

	err = config.DB.Model(&models.Tag{}).Where(&models.Tag{
		ID:      uint(id),
		SpaceID: sID,
	}).First(&result).Error

	if err != nil {
		return nil, nil
	}

	if cache.IsEnabled() {
		if err = cache.SaveToCache(ctx, result); err != nil {
			return result, nil
		}
	}

	return result, nil
}

func (r *queryResolver) Tags(ctx context.Context, ids []int, spaces []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.TagsPaging, error) {
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

	result := &models.TagsPaging{}
	result.Nodes = make([]*models.Tag, 0)

	offset, pageLimit := util.Parse(page, limit)

	var tx *gorm.DB

	if len(ids) > 0 {
		tx = config.DB.Model(&models.Tag{}).Where(ids)
	} else {
		tx = config.DB.Model(&models.Tag{})
	}

	var total int64
	tx.Where(&models.Tag{
		SpaceID: uint(sID),
	}).Count(&total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	if cache.IsEnabled() {
		if err = cache.SaveToCache(ctx, result); err != nil {
			return result, nil
		}
	}

	return result, nil
}

// Tag model resolver
func (r *Resolver) Tag() generated.TagResolver { return &tagResolver{r} }

type tagResolver struct{ *Resolver }
