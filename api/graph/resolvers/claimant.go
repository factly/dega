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
	"github.com/google/uuid"
)

func (r *claimantResolver) ID(ctx context.Context, obj *models.Claimant) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *claimantResolver) Description(ctx context.Context, obj *models.Claimant) (interface{}, error) {
	return obj.Description, nil
}

func (r *claimantResolver) DescriptionHTML(ctx context.Context, obj *models.Claimant) (*string, error) {
	return &obj.DescriptionHTML, nil
}

func (r *claimantResolver) MetaFields(ctx context.Context, obj *models.Claimant) (interface{}, error) {
	return obj.MetaFields, nil
}

func (r *claimantResolver) Medium(ctx context.Context, obj *models.Claimant) (*models.Medium, error) {
	if obj.MediumID == uuid.Nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.MediumID))
}

func (r *claimantResolver) Meta(ctx context.Context, obj *models.Claimant) (interface{}, error) {
	return obj.Meta, nil
}

func (r *claimantResolver) HeaderCode(ctx context.Context, obj *models.Claimant) (*string, error) {
	return &obj.HeaderCode, nil
}

func (r *claimantResolver) FooterCode(ctx context.Context, obj *models.Claimant) (*string, error) {
	return &obj.FooterCode, nil
}

func (r *queryResolver) Claimants(ctx context.Context, page *int, limit *int, sortBy *string, sortOrder *string) (*models.ClaimantsPaging, error) {
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

	result := &models.ClaimantsPaging{}
	result.Nodes = make([]*models.Claimant, 0)

	offset, pageLimit := util.Parse(page, limit)

	tx := config.DB.Model(&models.Claimant{})

	var total int64
	tx.Where(&models.Claimant{
		SpaceID: sID,
	}).Preload("Medium").Count(&total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	return result, nil
}

// Claimant model resolver
func (r *Resolver) Claimant() generated.ClaimantResolver { return &claimantResolver{r} }

type claimantResolver struct{ *Resolver }
