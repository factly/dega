package resolvers

import (
	"context"
	"errors"
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

func (r *categoryResolver) HTMLDescription(ctx context.Context, obj *models.Category) (*string, error) {
	return &obj.HTMLDescription, nil
}

func (r *categoryResolver) MetaFields(ctx context.Context, obj *models.Category) (interface{}, error) {
	return obj.MetaFields, nil
}

func (r *categoryResolver) Meta(ctx context.Context, obj *models.Category) (interface{}, error) {
	return obj.Meta, nil
}

func (r *categoryResolver) HeaderCode(ctx context.Context, obj *models.Category) (*string, error) {
	return &obj.HeaderCode, nil
}

func (r *categoryResolver) FooterCode(ctx context.Context, obj *models.Category) (*string, error) {
	return &obj.FooterCode, nil
}

func (r *queryResolver) Category(ctx context.Context, id *int, slug *string) (*models.Category, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	if id == nil && slug == nil {
		return nil, errors.New("please provide either id or slug")
	}

	result := &models.Category{}
	if id != nil {
		err = config.DB.Model(&models.Category{}).Where(&models.Category{
			ID:      uint(*id),
			SpaceID: sID,
		}).Preload("Medium").First(&result).Error
	} else {
		err = config.DB.Model(&models.Category{}).Where(&models.Category{
			Slug:    *slug,
			SpaceID: sID,
		}).Preload("Medium").First(&result).Error
	}
	if err != nil {
		return nil, nil
	}

	return result, nil
}

func (r *queryResolver) Categories(ctx context.Context, ids []int, spaces []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.CategoriesPaging, error) {
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

	result := &models.CategoriesPaging{}
	result.Nodes = make([]*models.Category, 0)

	offset, pageLimit := util.Parse(page, limit)

	var tx *gorm.DB

	if len(ids) > 0 {
		tx = config.DB.Model(&models.Category{}).Where(ids)
	} else {
		tx = config.DB.Model(&models.Category{})
	}

	var total int64
	tx.Where(&models.Category{
		SpaceID: uint(sID),
	}).Preload("Medium").Count(&total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	return result, nil
}

// Category model resolver
func (r *Resolver) Category() generated.CategoryResolver { return &categoryResolver{r} }

type categoryResolver struct{ *Resolver }
