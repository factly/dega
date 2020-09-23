package resolvers

import (
	"context"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
	"github.com/jinzhu/gorm"
)

func (r *queryResolver) Tag(ctx context.Context, id int) (*models.Tag, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.Tag{}

	err = config.DB.Model(&models.Tag{}).Where(&models.Tag{
		ID:      int(id),
		SpaceID: sID,
	}).First(&result).Error

	if err != nil {
		return nil, nil
	}

	return result, nil
}

func (r *queryResolver) Tags(ctx context.Context, ids []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.TagsPaging, error) {
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

	result := &models.TagsPaging{}
	result.Nodes = make([]*models.Tag, 0)

	offset, pageLimit := util.Parse(page, limit)

	var tx *gorm.DB

	if len(ids) > 0 {
		tx = config.DB.Model(&models.Tag{}).Where(ids)
	} else {
		tx = config.DB.Model(&models.Tag{})
	}

	tx.Where(&models.Tag{
		SpaceID: sID,
	}).Count(&result.Total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	return result, nil
}
