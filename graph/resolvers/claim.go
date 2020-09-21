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

func (r *claimResolver) Description(ctx context.Context, obj *models.Claim) (interface{}, error) {

	return obj.Description, nil
}

func (r *claimResolver) Rating(ctx context.Context, obj *models.Claim) (*models.Rating, error) {
	return loaders.GetRatingLoader(ctx).Load(fmt.Sprint(obj.RatingID))
}

func (r *claimResolver) Claimant(ctx context.Context, obj *models.Claim) (*models.Claimant, error) {
	return loaders.GetClaimantLoader(ctx).Load(fmt.Sprint(obj.ClaimantID))
}

func (r *queryResolver) Claims(ctx context.Context, ratings []string, claimants []string, page *int, limit *int, sortBy *string, sortOrder *string) (*models.ClaimsPaging, error) {
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

	result := &models.ClaimsPaging{}
	result.Nodes = make([]*models.Claim, 0)

	offset, pageLimit := util.Parse(page, limit)
	cIDs := make([]int, 0)

	if len(ratings) > 0 {
		rows := []models.Claim{}
		config.DB.Table("claims").Select("claims.id").Joins("INNER JOIN ratings ON ratings.id = claims.rating_id").Where("claims.space_id in (?)", sID).Where("ratings.slug in (?)", ratings).Scan(&rows)

		for _, row := range rows {
			cIDs = append(cIDs, row.ID)
		}
	}

	if len(claimants) > 0 {
		rows := []models.Claim{}
		tx := config.DB.Table("claims").Select("claims.id").Joins("INNER JOIN claimants ON claimants.id = claims.claimant_id").Where("claims.space_id in (?)", sID).Where("claimants.slug in (?)", claimants)
		if len(cIDs) > 0 {
			tx.Where("claims.id IN (?)", cIDs).Scan(&rows)
		} else {
			tx.Scan(&rows)
		}
		cIDs = []int{}
		for _, row := range rows {
			cIDs = append(cIDs, row.ID)
		}
	}

	var tx *gorm.DB

	if len(cIDs) > 0 {
		tx = config.DB.Model(&models.Claim{}).Where(cIDs)
	} else {
		tx = config.DB.Model(&models.Claim{})
	}
	tx.Count(&result.Total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	return result, nil
}

// Claim model resolver
func (r *Resolver) Claim() generated.ClaimResolver { return &claimResolver{r} }

type claimResolver struct{ *Resolver }
