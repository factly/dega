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

type postResolver struct{ *Resolver }

func (r *Resolver) Post() generated.PostResolver { return &postResolver{r} }

func (r *postResolver) Description(ctx context.Context, obj *models.Post) (interface{}, error) {
	return obj.Description, nil
}

func (r *postResolver) Format(ctx context.Context, obj *models.Post) (*models.Format, error) {
	return loaders.GetFormatLoader(ctx).Load(fmt.Sprint(obj.FormatID))
}

func (r *postResolver) Medium(ctx context.Context, obj *models.Post) (*models.Medium, error) {
	if obj.FeaturedMediumID == 0 {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.FeaturedMediumID))
}

func (r *postResolver) Categories(ctx context.Context, obj *models.Post) ([]*models.Category, error) {
	postCategories := []models.PostCategory{}

	// fetch all categories
	config.DB.Model(&models.PostCategory{}).Where(&models.PostCategory{
		PostID: obj.ID,
	}).Find(&postCategories)

	var allCategoryID []string

	for _, postCategory := range postCategories {
		allCategoryID = append(allCategoryID, fmt.Sprint(postCategory.CategoryID))
	}

	categories, _ := loaders.GetCategoryLoader(ctx).LoadAll(allCategoryID)
	return categories, nil
}

func (r *postResolver) Tags(ctx context.Context, obj *models.Post) ([]*models.Tag, error) {
	postTags := []models.PostTag{}

	config.DB.Model(&models.PostTag{}).Where(&models.PostTag{
		PostID: obj.ID,
	}).Find(&postTags)

	var allTagID []string

	for _, postTag := range postTags {
		allTagID = append(allTagID, fmt.Sprint(postTag.TagID))
	}

	tags, _ := loaders.GetTagLoader(ctx).LoadAll(allTagID)
	return tags, nil
}

func (r *postResolver) Claims(ctx context.Context, obj *models.Post) ([]*models.Claim, error) {
	postClaims := []models.PostClaim{}

	config.DB.Model(&models.PostClaim{}).Where(&models.PostClaim{
		PostID: obj.ID,
	}).Find(&postClaims)

	var allClaimID []string

	for _, postClaim := range postClaims {
		allClaimID = append(allClaimID, fmt.Sprint(postClaim.ClaimID))
	}

	claims, _ := loaders.GetClaimLoader(ctx).LoadAll(allClaimID)
	return claims, nil
}

func (r *postResolver) Users(ctx context.Context, obj *models.Post) ([]*models.User, error) {
	postUsers := []models.PostAuthor{}

	config.DB.Model(&models.PostAuthor{}).Where(&models.PostAuthor{
		PostID: obj.ID,
	}).Find(&postUsers)

	var allUserID []string

	for _, postUser := range postUsers {
		allUserID = append(allUserID, fmt.Sprint(postUser.AuthorID))
	}

	users, _ := loaders.GetUserLoader(ctx).LoadAll(allUserID)
	return users, nil
}

func (r *postResolver) Schemas(ctx context.Context, obj *models.Post) (interface{}, error) {
	result := make([]models.Schemas, 0)

	postClaims := []models.PostClaim{}

	config.DB.Model(&models.PostClaim{}).Where(&models.PostClaim{
		PostID: obj.ID,
	}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Claimant").Find(&postClaims)

	space := &models.Space{}
	space.ID = obj.SpaceID

	config.DB.First(&space)

	for _, each := range postClaims {
		schema := models.Schemas{}
		schema.Context = "https://schema.org"
		schema.Type = "ClaimReview"
		schema.DatePublished = obj.CreatedAt
		schema.URL = space.SiteAddress + "/" + obj.Slug
		schema.ClaimReviewed = each.Claim.Title
		schema.Author.Type = "Organization"
		schema.Author.Name = space.Name
		schema.Author.URL = &space.SiteAddress
		schema.ReviewRating.Type = "Rating"
		schema.ReviewRating.RatingValue = each.Claim.Rating.NumericValue
		schema.ReviewRating.AlternateName = each.Claim.Rating.Name
		// schema.ReviewRating.BestRating = 5
		// schema.ReviewRating.WorstRating = 1
		schema.ItemReviewed.Type = "Claim"
		schema.ItemReviewed.DatePublished = *each.Claim.CheckedDate
		schema.ItemReviewed.Appearance = each.Claim.ClaimSource
		schema.ItemReviewed.Author.Type = "Organization"
		schema.ItemReviewed.Author.Name = each.Claim.Claimant.Name

		result = append(result, schema)
	}

	return result, nil
}

func (r *queryResolver) Post(ctx context.Context, id int) (*models.Post, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.Post{}

	err = config.DB.Model(&models.Post{}).Where(&models.Post{
		ID:      int(id),
		SpaceID: sID,
	}).First(&result).Error

	if err != nil {
		return nil, nil
	}

	return result, nil
}

func (r *queryResolver) Posts(ctx context.Context, formats []int, categories []int, tags []int, users []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.PostsPaging, error) {
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

	result := &models.PostsPaging{}
	result.Nodes = make([]*models.Post, 0)

	offset, pageLimit := util.Parse(limit, page)

	pIDs := make([]int, 0)

	if len(categories) > 0 {
		rows := []models.Post{}
		config.DB.Table("posts").Select("posts.id").Joins("INNER JOIN post_categories ON post_categories.post_id = posts.id").Where("post_categories.category_id in (?)", categories).Where("posts.space_id in (?)", sID).Scan(&rows)
		for _, row := range rows {
			pIDs = append(pIDs, row.ID)
		}
	}

	if len(tags) > 0 {
		rows := []models.Post{}
		tx := config.DB.Table("posts").Select("posts.id").Joins("INNER JOIN post_tags ON post_tags.post_id = posts.id").Where("post_tags.tag_id in (?)", tags).Where("posts.space_id in (?)", sID)
		if len(pIDs) > 0 {
			tx.Where("posts.id IN (?)", pIDs).Scan(&rows)
		} else {
			tx.Scan(&rows)
		}
		pIDs = []int{}
		for _, row := range rows {
			pIDs = append(pIDs, row.ID)
		}
	}

	if len(users) > 0 {
		rows := []models.Post{}
		tx := config.DB.Table("posts").Select("posts.id").Joins("INNER JOIN post_users ON post_users.post_id = posts.id").Where("post_users.user_id in (?)", users).Where("posts.space_id in (?)", sID)
		if len(pIDs) > 0 {
			tx.Where("posts.id IN (?)", pIDs).Scan(&rows)
		} else {
			tx.Scan(&rows)
		}
		pIDs = []int{}
		for _, row := range rows {
			pIDs = append(pIDs, row.ID)
		}
	}

	if len(formats) > 0 {
		rows := []models.Post{}
		tx := config.DB.Table("posts").Select("posts.id").Where("posts.format_id in (?)", formats).Where("posts.space_id in (?)", sID)
		if len(pIDs) > 0 {
			tx.Where("posts.id IN (?)", pIDs).Scan(&rows)
		} else {
			tx.Scan(&rows)
		}
		pIDs = []int{}
		for _, row := range rows {
			pIDs = append(pIDs, row.ID)
		}
	}
	var tx *gorm.DB

	if len(pIDs) > 0 {
		tx = config.DB.Model(&models.Post{}).Where(pIDs)
	} else {
		tx = config.DB.Model(&models.Post{}).Where("space_id in (?)", sID)
	}

	tx.Count(&result.Total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	return result, nil
}
