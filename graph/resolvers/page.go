package resolvers

import (
	"context"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
	"github.com/factly/dega-api/util/cache"
)

func (r *queryResolver) Page(ctx context.Context, id int) (*models.Post, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.Post{}

	err = config.DB.Model(&models.Post{}).Where(&models.Post{
		ID:      uint(id),
		SpaceID: sID,
	}).Where("is_page = ?", true).First(&result).Error

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

func (r *queryResolver) Pages(ctx context.Context, spaces []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.PostsPaging, error) {
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

	result := &models.PostsPaging{}
	result.Nodes = make([]*models.Post, 0)

	offset, pageLimit := util.Parse(page, limit)

	var total int64
	config.DB.Model(&models.Post{}).Where("is_page = ?", true).Where(&models.Post{
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
