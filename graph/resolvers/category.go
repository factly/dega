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
	"github.com/jinzhu/gorm"
)

func (r *categoryResolver) ParentID(ctx context.Context, obj *models.Category) (int, error) {
	return int(obj.ID), nil
}

func (r *categoryResolver) Medium(ctx context.Context, obj *models.Category) (*models.Medium, error) {
	if obj.MediumID == nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.MediumID))
}

func (r *queryResolver) Category(ctx context.Context, id int) (*models.Category, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.Category{}

	err = config.DB.Model(&models.Category{}).Where(&models.Category{
		ID:      id,
		SpaceID: sID,
	}).First(&result).Error

	if err != nil {
		return nil, nil
	}

	return result, nil
}

func (r *queryResolver) Categories(ctx context.Context, ids []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.CategoriesPaging, error) {
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

	result := &models.CategoriesPaging{}
	result.Nodes = make([]*models.Category, 0)

	offset, pageLimit := util.Parse(page, limit)

	var tx *gorm.DB

	if len(ids) > 0 {
		tx = config.DB.Model(&models.Category{}).Where(ids)
	} else {
		tx = config.DB.Model(&models.Category{})
	}

	tx.Where(&models.Category{
		SpaceID: sID,
	}).Count(&result.Total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	return result, nil
}

// Category model resolver
func (r *Resolver) Category() generated.CategoryResolver { return &categoryResolver{r} }

type categoryResolver struct{ *Resolver }
