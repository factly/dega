package resolvers

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
	"gorm.io/gorm"
)

type postResolver struct{ *Resolver }

func (r *Resolver) Post() generated.PostResolver { return &postResolver{r} }

func (r *postResolver) ID(ctx context.Context, obj *models.Post) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *postResolver) SpaceID(ctx context.Context, obj *models.Post) (int, error) {
	return int(obj.SpaceID), nil
}

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
	ctxTimeout, cancel := context.WithTimeout(context.Background(), 1*time.Second)

	defer cancel()

	// fetch all categories
	config.DB.Session(&gorm.Session{Context: ctxTimeout}).Model(&models.PostCategory{}).Where(&models.PostCategory{
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
	ctxTimeout, cancel := context.WithTimeout(context.Background(), 1*time.Second)

	defer cancel()

	config.DB.Session(&gorm.Session{Context: ctxTimeout}).Model(&models.PostTag{}).Where(&models.PostTag{
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
	ctxTimeout, cancel := context.WithTimeout(context.Background(), 1*time.Second)

	defer cancel()

	config.DB.Session(&gorm.Session{Context: ctxTimeout}).Model(&models.PostClaim{}).Where(&models.PostClaim{
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
	ctxTimeout, cancel := context.WithTimeout(context.Background(), 1*time.Second)

	defer cancel()

	config.DB.Session(&gorm.Session{Context: ctxTimeout}).Model(&models.PostAuthor{}).Where(&models.PostAuthor{
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
	result := make([]interface{}, 0)

	postClaims := []models.PostClaim{}

	ctxTimeout, cancel := context.WithTimeout(context.Background(), 1*time.Second)

	defer cancel()

	config.DB.Session(&gorm.Session{Context: ctxTimeout}).Model(&models.PostClaim{}).Where(&models.PostClaim{
		PostID: obj.ID,
	}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Claimant").Find(&postClaims)

	space := &models.Space{}
	space.ID = obj.SpaceID

	config.DB.Session(&gorm.Session{Context: ctxTimeout}).Preload("Logo").First(&space)

	for _, each := range postClaims {
		claimSchema := models.FactCheckSchema{}
		claimSchema.Context = "https://schema.org"
		claimSchema.Type = "ClaimReview"
		claimSchema.DatePublished = obj.CreatedAt
		claimSchema.URL = space.SiteAddress + "/" + obj.Slug
		claimSchema.ClaimReviewed = each.Claim.Title
		claimSchema.Author.Type = "Organization"
		claimSchema.Author.Name = space.Name
		claimSchema.Author.URL = space.SiteAddress
		claimSchema.ReviewRating.Type = "Rating"
		claimSchema.ReviewRating.RatingValue = each.Claim.Rating.NumericValue
		claimSchema.ReviewRating.AlternateName = each.Claim.Rating.Name
		claimSchema.ReviewRating.BestRating = 5
		claimSchema.ReviewRating.WorstRating = 1
		claimSchema.ItemReviewed.Type = "Claim"
		claimSchema.ItemReviewed.DatePublished = each.Claim.CheckedDate
		claimSchema.ItemReviewed.Appearance = each.Claim.ClaimSources
		claimSchema.ItemReviewed.Author.Type = "Organization"
		claimSchema.ItemReviewed.Author.Name = each.Claim.Claimant.Name

		result = append(result, claimSchema)
	}

	postAuthors := []models.PostAuthor{}

	config.DB.Session(&gorm.Session{Context: ctxTimeout}).Model(&models.PostAuthor{}).Where(&models.PostAuthor{
		PostID: obj.ID,
	}).Find(&postAuthors)

	var allAuthorID []string

	for _, postAuthor := range postAuthors {
		allAuthorID = append(allAuthorID, fmt.Sprint(postAuthor.AuthorID))
	}

	authors, _ := loaders.GetUserLoader(ctx).LoadAll(allAuthorID)

	jsonLogo := map[string]string{}
	rawLogo, _ := space.Logo.URL.RawMessage.MarshalJSON()
	json.Unmarshal(rawLogo, &jsonLogo)

	articleSchema := models.ArticleSchema{}
	articleSchema.Context = "https://schema.org"
	articleSchema.Type = "NewsArticle"
	articleSchema.Headline = obj.Title
	articleSchema.Image = append(articleSchema.Image, models.Image{
		Type: "ImageObject",
		URL:  jsonLogo["raw"]})
	articleSchema.DatePublished = obj.PublishedDate
	for _, eachAuthor := range authors {
		articleSchema.Author = append(articleSchema.Author, models.Author{
			Type: "Person",
			Name: eachAuthor.FirstName + " " + eachAuthor.LastName,
		})
	}
	articleSchema.Publisher.Type = "Organization"
	articleSchema.Publisher.Name = space.Name
	articleSchema.Publisher.Logo.Type = "ImageObject"
	articleSchema.Publisher.Logo.URL = jsonLogo["raw"]

	result = append(result, articleSchema)

	return result, nil
}

func (r *queryResolver) Post(ctx context.Context, id int) (*models.Post, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.Post{}
	ctxTimeout, cancel := context.WithTimeout(context.Background(), 1*time.Second)

	defer cancel()

	err = config.DB.Session(&gorm.Session{Context: ctxTimeout}).Model(&models.Post{}).Where(&models.Post{
		ID:      uint(id),
		SpaceID: sID,
	}).First(&result).Error

	if err != nil {
		return nil, nil
	}

	return result, nil
}

func (r *queryResolver) Posts(ctx context.Context, spaces []int, formats []int, categories []int, tags []int, users []int, page *int, limit *int, sortBy *string, sortOrder *string) (*models.PostsPaging, error) {
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

	result := &models.PostsPaging{}
	result.Nodes = make([]*models.Post, 0)

	offset, pageLimit := util.Parse(page, limit)

	ctxTimeout, cancel := context.WithTimeout(context.Background(), 1*time.Second)

	defer cancel()

	tx := config.DB.Session(&gorm.Session{Context: ctxTimeout}).Model(&models.Post{})

	if len(spaces) > 0 {
		tx.Where("space_id IN (?)", spaces)
	}

	tx.Joins("INNER JOIN post_categories ON post_categories.post_id = posts.id").Joins("INNER JOIN post_tags ON post_tags.post_id = posts.id").Joins("INNER JOIN post_authors ON post_authors.post_id = posts.id").Group("posts.id")

	filterStr := ""

	if len(categories) > 0 {
		filterStr = filterStr + fmt.Sprint("post_categories.category_id IN (", strings.Trim(strings.Replace(fmt.Sprint(categories), " ", ",", -1), "[]"), ") AND ")
	}
	if len(users) > 0 {
		filterStr = filterStr + fmt.Sprint("post_authors.author_id IN (", strings.Trim(strings.Replace(fmt.Sprint(users), " ", ",", -1), "[]"), ") AND ")
	}
	if len(tags) > 0 {
		filterStr = filterStr + fmt.Sprint("post_tags.tag_id IN (", strings.Trim(strings.Replace(fmt.Sprint(tags), " ", ",", -1), "[]"), ") AND ")
	}
	if len(formats) > 0 {
		filterStr = filterStr + fmt.Sprint("posts.format_id IN (", strings.Trim(strings.Replace(fmt.Sprint(formats), " ", ",", -1), "[]"), ") AND ")
	}

	filterStr = strings.Trim(filterStr, " AND ")
	var total int64
	tx.Where(filterStr).Count(&total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	return result, nil
}
