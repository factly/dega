package resolvers

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
)

func (r *categoryResolver) ID(ctx context.Context, obj *models.Category) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *categoryResolver) ParentID(ctx context.Context, obj *models.Category) (*int, error) {
	dummyID := int(obj.ParentID)
	return &dummyID, nil
}

func (r *categoryResolver) SpaceID(ctx context.Context, obj *models.Category) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *categoryResolver) Medium(ctx context.Context, obj *models.Category) (*models.Medium, error) {
	if obj.MediumID == 0 {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.MediumID))
}

func (r *categoryResolver) Description(ctx context.Context, obj *models.Category) (interface{}, error) {
	return obj.Description, nil
}

func (r *categoryResolver) MetaFields(ctx context.Context, obj *models.Category) (interface{}, error) {
	return obj.MetaFields, nil
}

func (r *queryResolver) Category(ctx context.Context, id int) (*models.Category, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.Category{}

	err = config.DB.Model(&models.Category{}).Where(&models.Category{
		ID:      uint(id),
		SpaceID: sID,
	}).First(&result).Error

	if err != nil {
		return nil, nil
	}

	return result, nil
}

func (r *queryResolver) Categories(ctx context.Context, ids []int, spaces []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.CategoriesPaging, error) {
	columns := []string{"created_at", "updated_at", "name", "slug"}
	order := "created_at desc"
	pageSortBy := "created_at"
	pageSortOrder := "desc"

	if sortOrder != nil && *sortOrder == "asc" {
		pageSortOrder = "asc"
	}

	if sortBy != nil && util.ColumnValidator(*sortBy, columns) {
		pageSortBy = *sortBy
	}

	order = pageSortBy + " " + pageSortOrder

	result := &models.CategoriesPaging{}
	result.Nodes = make([]*models.Category, 0)

	offset, pageLimit := util.Parse(page, limit)

	var tx *gorm.DB

	if len(ids) > 0 {
		tx = config.DB.Model(&models.Category{}).Where(ids)
	} else {
		tx = config.DB.Model(&models.Category{})
	}

	if len(spaces) > 0 {
		tx.Where("space_id IN (?)", spaces)
	}

	var total int64
	tx.Count(&total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	return result, nil
}

// Category model resolver
func (r *Resolver) Category() generated.CategoryResolver { return &categoryResolver{r} }

type categoryResolver struct{ *Resolver }
