package resolvers

import (
	"context"
	"fmt"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
)

func (r *formatResolver) ID(ctx context.Context, obj *models.Format) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *formatResolver) SpaceID(ctx context.Context, obj *models.Format) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *formatResolver) MetaFields(ctx context.Context, obj *models.Format) (interface{}, error) {
	return obj.MetaFields, nil
}

func (r *formatResolver) Meta(ctx context.Context, obj *models.Format) (interface{}, error) {
	return obj.Meta, nil
}

func (r *formatResolver) HeaderCode(ctx context.Context, obj *models.Format) (*string, error) {
	return &obj.HeaderCode, nil
}

func (r *formatResolver) FooterCode(ctx context.Context, obj *models.Format) (*string, error) {
	return &obj.FooterCode, nil
}

func (r *formatResolver) Medium(ctx context.Context, obj *models.Format) (*models.Medium, error) {
	if obj.MediumID == 0 {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.MediumID))
}

func (r *queryResolver) Formats(ctx context.Context, spaces []int, slugs []string) (*models.FormatsPaging, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}
	result := &models.FormatsPaging{}
	result.Nodes = make([]*models.Format, 0)

	var total int64
	tx := config.DB.Model(&models.Format{}).Where(&models.Format{
		SpaceID: uint(sID),
	})

	if len(slugs) > 0 {
		tx.Where("slug IN (?)", slugs)
	}

	tx.Count(&total).Order("id desc").Find(&result.Nodes)

	result.Total = int(total)

	return result, nil
}

// Format model resolver
func (r *Resolver) Format() generated.FormatResolver { return &formatResolver{r} }

type formatResolver struct{ *Resolver }
