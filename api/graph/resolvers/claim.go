package resolvers

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
	"github.com/google/uuid"
)

func (r *claimResolver) ID(ctx context.Context, obj *models.Claim) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *claimResolver) Description(ctx context.Context, obj *models.Claim) (interface{}, error) {
	return obj.Description, nil
}

func (r *claimResolver) DescriptionHTML(ctx context.Context, obj *models.Claim) (*string, error) {
	return &obj.DescriptionHTML, nil
}

func (r *claimResolver) ClaimSources(ctx context.Context, obj *models.Claim) (interface{}, error) {
	return obj.ClaimSources, nil
}

func (r *claimResolver) Fact(ctx context.Context, obj *models.Claim) (string, error) {
	return obj.Fact, nil
}

func (r *claimResolver) ReviewSources(ctx context.Context, obj *models.Claim) (interface{}, error) {
	return obj.ReviewSources, nil
}

func (r *claimResolver) MetaFields(ctx context.Context, obj *models.Claim) (interface{}, error) {
	return obj.MetaFields, nil
}

func (r *claimResolver) ClaimDate(ctx context.Context, obj *models.Claim) (*time.Time, error) {
	return obj.ClaimDate, nil
}

func (r *claimResolver) CheckedDate(ctx context.Context, obj *models.Claim) (*time.Time, error) {
	return obj.CheckedDate, nil
}

func (r *claimResolver) Rating(ctx context.Context, obj *models.Claim) (*models.Rating, error) {
	return loaders.GetRatingLoader(ctx).Load(fmt.Sprint(obj.RatingID))
}

func (r *claimResolver) Claimant(ctx context.Context, obj *models.Claim) (*models.Claimant, error) {
	return loaders.GetClaimantLoader(ctx).Load(fmt.Sprint(obj.ClaimantID))
}

func (r *claimResolver) Meta(ctx context.Context, obj *models.Claim) (interface{}, error) {
	return obj.Meta, nil
}

func (r *claimResolver) HeaderCode(ctx context.Context, obj *models.Claim) (*string, error) {
	return &obj.HeaderCode, nil
}

func (r *claimResolver) FooterCode(ctx context.Context, obj *models.Claim) (*string, error) {
	return &obj.FooterCode, nil
}

func (r *claimResolver) Medium(ctx context.Context, obj *models.Claim) (*models.Medium, error) {
	if obj.MediumID == uuid.Nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.MediumID))
}

func (r *queryResolver) Claims(ctx context.Context, ids []string, ratings []string, claimants []string, page *int, limit *int, sortBy *string, sortOrder *string) (*models.ClaimsPaging, error) {
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

	result := &models.ClaimsPaging{}
	result.Nodes = make([]*models.Claim, 0)

	offset, pageLimit := util.Parse(page, limit)

	tx := config.DB.Model(&models.Claim{})

	filterStr := ""

	if len(ids) > 0 {
		filterStr = filterStr + fmt.Sprint("de_claim.id IN (", strings.Trim(strings.Replace(fmt.Sprint(ids), " ", ",", -1), "[]"), ") AND ")
	}

	if len(ratings) > 0 {
		filterStr = filterStr + fmt.Sprint("de_claim.rating_id IN (", strings.Trim(strings.Replace(fmt.Sprint(ratings), " ", ",", -1), "[]"), ") AND ")
	}

	if len(claimants) > 0 {
		filterStr = filterStr + fmt.Sprint("de_claim.claimant_id IN (", strings.Trim(strings.Replace(fmt.Sprint(claimants), " ", ",", -1), "[]"), ") AND ")
	}

	filterStr = strings.Trim(filterStr, " AND")

	var total int64
	tx.Where(&models.Claim{
		SpaceID: sID,
	}).Where(filterStr).Preload("Claimant").Preload("Rating").Count(&total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	return result, nil
}

// Claim model resolver
func (r *Resolver) Claim() generated.ClaimResolver { return &claimResolver{r} }

type claimResolver struct{ *Resolver }
