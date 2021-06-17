package resolvers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
	"github.com/factly/dega-api/util/cache"
	"github.com/factly/x/requestx"
	"github.com/spf13/viper"
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

func (r *postResolver) HTMLDescription(ctx context.Context, obj *models.Post) (*string, error) {
	return &obj.HTMLDescription, nil
}

func (r *postResolver) PublishedDate(ctx context.Context, obj *models.Post) (*time.Time, error) {
	return obj.PublishedDate, nil
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
	res := make([]models.PostCategory, 0)
	cats := make([]string, 0)

	// fetch all tags
	config.DB.Model(&models.PostCategory{}).Where(&models.PostCategory{
		PostID: obj.ID,
	}).Find(&res)

	for _, postCat := range res {
		cats = append(cats, fmt.Sprint(postCat.CategoryID))
	}

	categories, _ := loaders.GetCategoryLoader(ctx).LoadAll(cats)
	return categories, nil
}

func (r *postResolver) Tags(ctx context.Context, obj *models.Post) ([]*models.Tag, error) {
	res := make([]models.PostTag, 0)
	tags := make([]string, 0)

	// fetch all tags
	config.DB.Model(&models.PostTag{}).Where(&models.PostTag{
		PostID: obj.ID,
	}).Find(&res)

	for _, postTag := range res {
		tags = append(tags, fmt.Sprint(postTag.TagID))
	}

	tagList, _ := loaders.GetTagLoader(ctx).LoadAll(tags)
	return tagList, nil
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
	}).Where("deleted_at IS NULL").Find(&postUsers)

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

	config.DB.Model(&models.PostClaim{}).Where(&models.PostClaim{
		PostID: obj.ID,
	}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Claimant").Find(&postClaims)

	space := &models.Space{}
	space.ID = obj.SpaceID

	ratings := make([]models.Rating, 0)

	config.DB.Model(&models.Rating{}).Where(&models.Rating{SpaceID: space.ID}).Order("numeric_value asc").Find(&ratings)

	bestRating := 5
	worstRating := 1
	if len(ratings) > 2 {
		bestRating = ratings[len(ratings)-1].NumericValue
		worstRating = ratings[0].NumericValue
	}

	config.DB.Preload("Logo").First(&space)

	for _, each := range postClaims {
		claimSchema := models.FactCheckSchema{}
		claimSchema.Context = "https://schema.org"
		claimSchema.Type = "ClaimReview"
		claimSchema.DatePublished = obj.CreatedAt
		claimSchema.URL = space.SiteAddress + "/" + obj.Slug
		claimSchema.ClaimReviewed = each.Claim.Claim
		claimSchema.Author.Type = "Organization"
		claimSchema.Author.Name = space.Name
		claimSchema.Author.URL = space.SiteAddress
		claimSchema.ReviewRating.Type = "Rating"
		claimSchema.ReviewRating.RatingValue = each.Claim.Rating.NumericValue
		claimSchema.ReviewRating.AlternateName = each.Claim.Rating.Name
		claimSchema.ReviewRating.BestRating = bestRating
		claimSchema.ReviewRating.RatingExplaination = each.Claim.Fact
		claimSchema.ReviewRating.WorstRating = worstRating
		claimSchema.ItemReviewed.Type = "Claim"
		claimSchema.ItemReviewed.DatePublished = *each.Claim.CheckedDate
		claimSchema.ItemReviewed.Appearance = each.Claim.ClaimSources
		claimSchema.ItemReviewed.Author.Type = "Organization"
		claimSchema.ItemReviewed.Author.Name = each.Claim.Claimant.Name

		result = append(result, claimSchema)
	}

	postAuthors := []models.PostAuthor{}

	config.DB.Model(&models.PostAuthor{}).Where(&models.PostAuthor{
		PostID: obj.ID,
	}).Find(&postAuthors)

	var allAuthorID []string

	for _, postAuthor := range postAuthors {
		allAuthorID = append(allAuthorID, fmt.Sprint(postAuthor.AuthorID))
	}

	authors, _ := loaders.GetUserLoader(ctx).LoadAll(allAuthorID)

	jsonLogo := map[string]string{}

	if space.Logo != nil {
		rawLogo, _ := space.Logo.URL.RawMessage.MarshalJSON()
		_ = json.Unmarshal(rawLogo, &jsonLogo)
	}

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
			URL:  fmt.Sprint(space.SiteAddress, "/users/", eachAuthor.Slug),
		})
	}
	articleSchema.Publisher.Type = "Organization"
	articleSchema.Publisher.Name = space.Name
	articleSchema.Publisher.Logo.Type = "ImageObject"
	articleSchema.Publisher.Logo.URL = jsonLogo["raw"]

	result = append(result, articleSchema)

	return result, nil
}

type redisPost struct {
	models.Post
	Claims []*models.Claim `json:"claims,omitempty"`
	Users  []*models.User  `json:"users,omitempty"`
}

func (r *queryResolver) Post(ctx context.Context, id *int, slug *string, include_page *bool) (*models.Post, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	if id == nil && slug == nil {
		return nil, errors.New("please provide either id or slug")
	}

	result := &models.Post{}
	tx := config.DB.Model(&models.Post{})
	if id != nil {
		tx.Where(&models.Post{
			ID:      uint(*id),
			SpaceID: sID,
		})
	} else {
		tx.Where(&models.Post{
			Slug:    *slug,
			SpaceID: sID,
		})
	}

	if include_page == nil || !*include_page {
		err = tx.Where("is_page = ?", false).First(&result).Error
	} else {
		err = tx.First(&result).Error
	}

	if err != nil {
		return nil, nil
	}

	// preload every associations and store object in cache
	if cache.IsEnabled() {
		postObj := redisPost{}
		postObj.Post.ID = result.ID
		config.DB.Model(&postObj.Post).Preload("Tags").Preload("Categories").Preload("Format").Preload("Medium").Find(&postObj.Post)

		postUsers := []models.PostAuthor{}
		config.DB.Model(&models.PostAuthor{}).Where(&models.PostAuthor{
			PostID: result.ID,
		}).Find(&postUsers)

		var allUserID []string
		for _, postUser := range postUsers {
			allUserID = append(allUserID, fmt.Sprint(postUser.AuthorID))
		}

		postObj.Users, _ = loaders.GetUserLoader(ctx).LoadAll(allUserID)

		if postObj.Post.Format.Slug == "fact-check" {
			postObj.Claims = make([]*models.Claim, 0)
			postClaims := []models.PostClaim{}
			config.DB.Model(&models.PostClaim{}).Where(&models.PostClaim{
				PostID: result.ID,
			}).Preload("Claim").Preload("Claim.Claimant").Preload("Claim.Rating").Find(&postClaims)

			for _, postClaim := range postClaims {
				postObj.Claims = append(postObj.Claims, postClaim.Claim)
			}
		}

		if err = cache.SaveToCache(ctx, postObj); err != nil {
			return result, nil
		}
	}

	return result, nil
}

type redisPostPaging struct {
	Nodes []redisPost `json:"nodes,omitempty"`
	Total int64       `json:"total,omitempty"`
}

func (r *queryResolver) Posts(ctx context.Context, spaces []int, formats *models.PostFilter, categories *models.PostFilter, tags *models.PostFilter, users *models.PostFilter, status *string, page *int, limit *int, sortBy *string, sortOrder *string) (*models.PostsPaging, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}
	oID, err := validator.GetOrganisation(ctx)
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

	result := &models.PostsPaging{}
	result.Nodes = make([]*models.Post, 0)

	offset, pageLimit := util.Parse(page, limit)

	tx := config.DB.Model(&models.Post{}).Where("is_page = ?", false)

	if status != nil {
		tx.Where("status = ?", status)
	} else {
		tx.Where("status = ?", "publish")
	}

	userIDs := make([]int, 0)
	// get user ids if slugs provided
	if users != nil && len(users.Ids) == 0 && len(users.Slugs) > 0 {
		var userID int
		// fetch all posts of current space
		postList := make([]models.Post, 0)
		config.DB.Model(&models.Post{}).Where(&models.Post{
			SpaceID: uint(sID),
		}).Find(&postList)

		postIDs := make([]uint, 0)
		for _, each := range postList {
			postIDs = append(postIDs, each.ID)
		}

		postAuthors := make([]models.PostAuthor, 0)
		config.DB.Model(&models.PostAuthor{}).Where("post_id IN (?)", postIDs).Find(&postAuthors)

		if len(postAuthors) > 0 {
			userID = int(postAuthors[0].AuthorID)
		} else {
			return nil, errors.New("please provide ID instead of slug")
		}

		userSlugMap := make(map[string]int)
		url := fmt.Sprint(viper.GetString("kavach_url"), "/users/application?application=dega")

		resp, err := requestx.Request("GET", url, nil, map[string]string{
			"Content-Type":   "application/json",
			"X-User":         fmt.Sprint(userID),
			"X-Organisation": fmt.Sprint(oID),
		})

		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		usersResp := models.UsersPaging{}
		err = json.NewDecoder(resp.Body).Decode(&usersResp)
		if err != nil {
			return nil, nil
		}

		for _, u := range usersResp.Nodes {
			userSlugMap[u.Slug] = int((*u).ID)
		}

		for _, each := range users.Slugs {
			userIDs = append(userIDs, userSlugMap[each])
		}
	} else if users != nil && len(users.Ids) > 0 && len(users.Slugs) == 0 {
		userIDs = users.Ids
	} else if users != nil && len(users.Ids) > 0 && len(users.Slugs) > 0 {
		userIDs = users.Ids
	}

	filterStr := ""
	if categories != nil {
		tx.Joins("INNER JOIN post_categories ON post_categories.post_id = posts.id")
		if len(categories.Ids) > 0 {
			filterStr = filterStr + fmt.Sprint("post_categories.category_id IN (", strings.Trim(strings.Replace(fmt.Sprint(categories.Ids), " ", ",", -1), "[]"), ") AND ")
		} else if len(tags.Slugs) > 0 {
			tx.Joins("INNER JOIN categories ON post_categories.category_id = categories.id")
			filterStr = filterStr + fmt.Sprint("categories.slug IN (", createFilters(categories.Slugs), ") AND ")
		}
	}

	if len(userIDs) > 0 {
		tx.Joins("INNER JOIN post_authors ON post_authors.post_id = posts.id")
		filterStr = filterStr + fmt.Sprint("post_authors.author_id IN (", strings.Trim(strings.Replace(fmt.Sprint(userIDs), " ", ",", -1), "[]"), ") AND ")
	}

	if tags != nil {
		tx.Joins("INNER JOIN post_tags ON post_tags.post_id = posts.id")
		if len(tags.Ids) > 0 {
			filterStr = filterStr + fmt.Sprint("post_tags.tag_id IN (", strings.Trim(strings.Replace(fmt.Sprint(tags.Ids), " ", ",", -1), "[]"), ") AND ")
		} else if len(tags.Slugs) > 0 {
			tx.Joins("INNER JOIN tags ON post_tags.tag_id = tags.id")
			filterStr = filterStr + fmt.Sprint("tags.slug IN (", createFilters(tags.Slugs), ") AND ")
		}
	}

	if formats != nil {
		if len(formats.Ids) > 0 {
			filterStr = filterStr + fmt.Sprint("posts.format_id IN (", strings.Trim(strings.Replace(fmt.Sprint(formats.Ids), " ", ",", -1), "[]"), ") AND ")
		} else if len(formats.Slugs) > 0 {
			tx.Joins("INNER JOIN formats ON posts.format_id = formats.id")
			filterStr = filterStr + fmt.Sprint("formats.slug IN (", createFilters(formats.Slugs), ") AND ")
		}
	}

	tx.Group("posts.id")

	filterStr = strings.Trim(filterStr, " AND")
	var total int64
	tx.Where(&models.Post{
		SpaceID: uint(sID),
	}).Where(filterStr).Count(&total).Order(order).Offset(offset).Limit(pageLimit).Find(&result.Nodes)

	result.Total = int(total)

	postIDs := make([]uint, 0)
	for _, each := range result.Nodes {
		postIDs = append(postIDs, each.ID)
	}

	// preload every associations and store object in cache
	if cache.IsEnabled() {
		postObj := redisPostPaging{}
		postObj.Nodes = make([]redisPost, 0)
		postList := make([]models.Post, 0)
		config.DB.Model(&models.Post{}).Preload("Tags").Preload("Categories").Preload("Format").Preload("Medium").Where(postIDs).Count(&postObj.Total).Find(&postList)

		// get all users
		postUsers := []models.PostAuthor{}
		config.DB.Model(&models.PostAuthor{}).Where("post_id IN (?) AND deleted_at IS NULL", postIDs).Find(&postUsers)

		var allUserID []string
		postUserMap := make(map[uint][]uint)
		for _, postUser := range postUsers {
			allUserID = append(allUserID, fmt.Sprint(postUser.AuthorID))
			if _, found := postUserMap[postUser.PostID]; !found {
				postUserMap[postUser.PostID] = make([]uint, 0)
			}
			postUserMap[postUser.PostID] = append(postUserMap[postUser.PostID], postUser.AuthorID)
		}
		users, _ := loaders.GetUserLoader(ctx).LoadAll(allUserID)

		userMap := make(map[uint]*models.User)
		for _, user := range users {
			if user != nil {
				userMap[user.ID] = user
			}
		}

		for _, post := range postList {
			redisPost := redisPost{}
			if post.Format.Slug == "fact-check" {
				redisPost.Claims = make([]*models.Claim, 0)
				postClaims := []models.PostClaim{}
				config.DB.Model(&models.PostClaim{}).Where(&models.PostClaim{
					PostID: post.ID,
				}).Preload("Claim").Preload("Claim.Claimant").Preload("Claim.Rating").Find(&postClaims)

				for _, postClaim := range postClaims {
					redisPost.Claims = append(redisPost.Claims, postClaim.Claim)
				}
			}

			for _, postAuthor := range postUserMap[post.ID] {
				if _, found := userMap[postAuthor]; found && userMap[postAuthor] != nil {
					redisPost.Users = append(redisPost.Users, userMap[postAuthor])
				}
			}

			redisPost.Post = post
			postObj.Nodes = append(postObj.Nodes, redisPost)
		}

		if err = cache.SaveToCache(ctx, postObj); err != nil {
			return result, nil
		}
	}

	return result, nil
}

func createFilters(arr []string) string {
	filter := strings.Trim(strings.Replace(fmt.Sprint(arr), " ", "','", -1), "[]")
	filter = "'" + filter + "'"
	return filter
}
