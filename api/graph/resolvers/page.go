package resolvers

import (
	"context"
	"errors"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
	"github.com/google/uuid"
)

func (r *queryResolver) Page(ctx context.Context, id *string, slug *string) (*models.Post, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	if id == nil && slug == nil {
		return nil, errors.New("please provide either id or slug")
	}

	pID := uuid.UUID{}
	if id != nil {
		pID, err = uuid.Parse(*id)
		if err != nil {
			return nil, errors.New("please provide valid id")
		}
	}

	result := &models.Post{}

	if id != nil {
		err = config.DB.Model(&models.Post{}).Where(&models.Post{
			ID:      pID,
			SpaceID: sID,
		}).Where("is_page = ?", true).First(&result).Error
	} else {
		err = config.DB.Model(&models.Post{}).Where(&models.Post{
			Slug:    *slug,
			SpaceID: sID,
		}).Where("is_page = ?", true).First(&result).Error
	}

	if err != nil {
		return nil, nil
	}

	return result, nil
}

func (r *queryResolver) Pages(ctx context.Context, page *int, limit *int, sortBy *string, sortOrder *string) (*models.PostsPaging, error) {
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
		SpaceID: sID,
	}).Count(&total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	return result, nil
}
