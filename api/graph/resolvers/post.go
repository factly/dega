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

func (r *postResolver) HeaderCode(ctx context.Context, obj *models.Post) (*string, error) {
	return &obj.HeaderCode, nil
}

func (r *postResolver) MetaFields(ctx context.Context, obj *models.Post) (interface{}, error) {
	return obj.MetaFields, nil
}

func (r *postResolver) FooterCode(ctx context.Context, obj *models.Post) (*string, error) {
	return &obj.FooterCode, nil
}

func (r *postResolver) PublishedDate(ctx context.Context, obj *models.Post) (*time.Time, error) {
	return obj.PublishedDate, nil
}

func (r *postResolver) Meta(ctx context.Context, obj *models.Post) (interface{}, error) {
	return obj.Meta, nil
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

func (r *postResolver) ClaimOrder(ctx context.Context, obj *models.Post) ([]*int, error) {
	var claimOrder []*int

	format, err := loaders.GetFormatLoader(ctx).Load(fmt.Sprint(obj.FormatID))
	if err != nil {
		return nil, err
	}

	if format.Slug == "fact-check" {
		postClaims := make([]models.PostClaim, 0)
		config.DB.Model(&models.PostClaim{}).Where(&models.PostClaim{
			PostID: uint(obj.ID),
		}).Find(&postClaims)

		claimOrder = make([]*int, len(postClaims))
		for _, pc := range postClaims {
			claimID := int(pc.ClaimID)
			claimOrder[pc.Position-1] = &claimID
		}
	}

	return claimOrder, nil
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
	var schema interface{}
	if err := json.Unmarshal(obj.Schemas.RawMessage, &schema); err != nil {
		return schema, nil
	}
	return schema, nil
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

	return result, nil
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

	order := "posts." + pageSortBy + " " + pageSortOrder

	result := &models.PostsPaging{}
	result.Nodes = make([]*models.Post, 0)

	offset, pageLimit := parse(page, limit)

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
		} else if len(categories.Slugs) > 0 {
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
	}).Where(filterStr).Count(&total).Offset(offset).Limit(pageLimit).Order(order).Select("posts.*").Find(&result.Nodes)

	tx.Commit()

	result.Total = int(total)

	return result, nil
}

func createFilters(arr []string) string {
	filter := strings.Trim(strings.Replace(fmt.Sprint(arr), " ", "','", -1), "[]")
	filter = "'" + filter + "'"
	return filter
}

// Parse pagination
func parse(page *int, perPage *int) (int, int) {
	offset := 0  // no. of records to skip
	limit := 100 // limit

	if page == nil || perPage == nil {
		return offset, limit
	}

	if *perPage > 0 && *perPage <= 100 {
		limit = *perPage
	}

	if *page > 1 {
		offset = (*page - 1) * limit
	}

	return offset, limit
}
