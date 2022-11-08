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

func (r *tagResolver) ID(ctx context.Context, obj *models.Tag) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *tagResolver) IsFeatured(ctx context.Context, obj *models.Tag) (*bool, error) {
	return &obj.IsFeatured, nil
}

func (r *tagResolver) SpaceID(ctx context.Context, obj *models.Tag) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *tagResolver) DescriptionHTML(ctx context.Context, obj *models.Tag) (*string, error) {
	return &obj.DescriptionHTML, nil
}

func (r *tagResolver) BackgroundColour(ctx context.Context, obj *models.Tag) (interface{}, error) {
	return obj.BackgroundColour, nil
}

func (r *tagResolver) MetaFields(ctx context.Context, obj *models.Tag) (interface{}, error) {
	return obj.MetaFields, nil
}

func (r *tagResolver) Meta(ctx context.Context, obj *models.Tag) (interface{}, error) {
	return obj.Meta, nil
}

func (r *tagResolver) HeaderCode(ctx context.Context, obj *models.Tag) (*string, error) {
	return &obj.HeaderCode, nil
}

func (r *tagResolver) FooterCode(ctx context.Context, obj *models.Tag) (*string, error) {
	return &obj.FooterCode, nil
}

func (r *tagResolver) Medium(ctx context.Context, obj *models.Tag) (*models.Medium, error) {
	if obj.MediumID == 0 {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.MediumID))
}

func (r *tagResolver) Posts(ctx context.Context, obj *models.Tag) (*models.PostsPaging, error) {
	postCount := 20 // remove this hardcoded value
	res := make([]models.PostTag, 0)
	err := config.DB.Model(&models.PostTag{}).Where(&models.PostTag{
		TagID: obj.ID,
	}).Limit(postCount).Find(&res).Error
	if err != nil {
		return nil, err
	}
	posts := make([]*models.Post, 0)
	for _, postTag := range res {
		post := new(models.Post)
		err = config.DB.Model(&models.Post{}).Where(&models.Post{
			ID: postTag.PostID,
		}).Find(&post).Error
		if err != nil {
			return nil, err
		}

		if post.Status == "publish" {
			posts = append(posts, post)
		}
	}
	response := new(models.PostsPaging)
	response.Nodes = posts
	response.Total = len(posts)
	return response, nil
}

func (r *queryResolver) Tag(ctx context.Context, id *int, slug *string) (*models.Tag, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	if id == nil && slug == nil {
		return nil, errors.New("please provide either id or slug")
	}

	result := &models.Tag{}

	if id != nil {
		err = config.DB.Model(&models.Tag{}).Where(&models.Tag{
			ID:      uint(*id),
			SpaceID: sID,
		}).First(&result).Error
	} else {
		err = config.DB.Model(&models.Tag{}).Where(&models.Tag{
			Slug:    *slug,
			SpaceID: sID,
		}).First(&result).Error

	}

	if err != nil {
		return nil, nil
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

	return result, nil
}

func (r *queryResolver) FeaturedTags(ctx context.Context, featuredCount int, postLimit int) (*models.TagsPaging, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}
	result := &models.TagsPaging{}
	result.Nodes = make([]*models.Tag, 0)

	err = config.DB.Model(&models.Tag{}).Where(&models.Tag{
		SpaceID:    sID,
		IsFeatured: true,
	}).Limit(featuredCount).Find(&result.Nodes).Error
	if err != nil {
		return nil, err
	}

	result.Total = len(result.Nodes)
	return nil, nil
}

// Tag model resolver
func (r *Resolver) Tag() generated.TagResolver { return &tagResolver{r} }

type tagResolver struct{ *Resolver }
