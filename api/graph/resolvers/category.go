package resolvers

import (
	"context"
	"errors"
	"fmt"
	"log"

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
func (r *categoryResolver) IsFeatured(ctx context.Context, obj *models.Category) (*bool, error) {
	return &obj.IsFeatured, nil
}

func (r *categoryResolver) HTMLDescription(ctx context.Context, obj *models.Category) (*string, error) {
	return &obj.HTMLDescription, nil
}
func (r *categoryResolver) BackgroundColour(ctx context.Context, obj *models.Category) (interface{}, error) {
	return &obj.BackgroundColour, nil
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

func (r *categoryResolver) Posts(ctx context.Context, obj *models.Category) (*models.PostsPaging, error) {
	postCount := 20 // remove this hardcoded value

	res := make([]models.PostCategory, 0)
	err := config.DB.Model(&models.PostCategory{}).Where(&models.PostCategory{
		CategoryID: obj.ID,
	}).Limit(postCount).Find(&res).Error
	if err != nil {
		return nil, err
	}
	posts := make([]*models.Post, 0)
	for _, postCat := range res {
		post := new(models.Post)
		err = config.DB.Model(&models.Post{}).Where(&models.Post{
			ID: postCat.PostID,
		}).Find(&post).Error
		if err != nil {
			return nil, err
		}

		posts = append(posts, post)
	}
	response := new(models.PostsPaging)
	response.Nodes = posts
	response.Total = len(posts)
	return response, nil
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

func (r *queryResolver) FeaturedCategories(ctx context.Context, featuredCount int, postLimit int) (*models.CategoriesPaging, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.CategoriesPaging{}
	result.Nodes = make([]*models.Category, 0)

	err = config.DB.Model(&models.Category{}).Where(&models.Category{
		SpaceID:    sID,
		IsFeatured: true,
	}).Limit(featuredCount).Find(&result.Nodes).Error
	if err != nil {
		return nil, err
	}

	result.Total = len(result.Nodes)
	return result, nil
}

func (r *queryResolver) Categories(ctx context.Context, ids []int, spaces []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.CategoriesPaging, error) {

	log.Println(" categories resolver entry")
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
