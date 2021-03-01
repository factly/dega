package post

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/spf13/viper"
	"gorm.io/gorm"
)

// create - Create post
// @Summary Create post
// @Description Create post
// @Tags Post
// @ID add-post
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Post body post true "Post Object"
// @Success 201 {object} postData
// @Router /core/posts [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	post := post{}

	err = json.NewDecoder(r.Body).Decode(&post)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(post)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	post.SpaceID = uint(sID)

	result, errMessage := createPost(r.Context(), post, "draft")

	if errMessage.Code != 0 {
		errorx.Render(w, errorx.Parser(errMessage))
		return
	}

	renderx.JSON(w, http.StatusCreated, result)
}

func createPost(ctx context.Context, post post, status string) (*postData, errorx.Message) {
	result := &postData{}
	result.Authors = make([]model.Author, 0)
	result.Claims = make([]factCheckModel.Claim, 0)

	sID, err := middlewarex.GetSpace(ctx)
	if err != nil {
		loggerx.Error(err)
		return nil, errorx.Unauthorized()
	}

	uID, err := middlewarex.GetUser(ctx)
	if err != nil {
		loggerx.Error(err)
		return nil, errorx.Unauthorized()
	}

	if viper.GetBool("create_super_organisation") {
		// Fetch space permissions
		permission := model.SpacePermission{}
		err = config.DB.Model(&model.SpacePermission{}).Where(&model.SpacePermission{
			SpaceID: uint(sID),
		}).First(&permission).Error

		if err != nil {
			return nil, errorx.GetMessage("cannot create more posts", http.StatusUnprocessableEntity)
		}

		// Fetch total number of posts in space
		var totPosts int64
		config.DB.Model(&model.Post{}).Where(&model.Post{
			SpaceID: uint(sID),
		}).Where("status != 'template'").Count(&totPosts)

		if totPosts >= permission.Posts && permission.Posts > 0 {
			return nil, errorx.GetMessage("cannot create more posts", http.StatusUnprocessableEntity)
		}
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Post{})
	tableName := stmt.Schema.Table

	var postSlug string
	if post.Slug != "" && slugx.Check(post.Slug) {
		postSlug = post.Slug
	} else {
		postSlug = slugx.Make(post.Title)
	}

	featuredMediumID := &post.FeaturedMediumID
	if post.FeaturedMediumID == 0 {
		featuredMediumID = nil
	}

	result.Post = model.Post{
		Title:            post.Title,
		Slug:             slugx.Approve(&config.DB, postSlug, sID, tableName),
		Status:           status,
		Page:             post.Page,
		Subtitle:         post.Subtitle,
		Excerpt:          post.Excerpt,
		Description:      post.Description,
		IsFeatured:       post.IsFeatured,
		IsHighlighted:    post.IsHighlighted,
		IsSticky:         post.IsSticky,
		FeaturedMediumID: featuredMediumID,
		FormatID:         post.FormatID,
		SpaceID:          post.SpaceID,
	}

	if status == "publish" {
		result.Post.PublishedDate = time.Now()
	} else {
		result.Post.PublishedDate = time.Time{}
	}

	if len(post.TagIDs) > 0 {
		config.DB.Model(&model.Tag{}).Where(post.TagIDs).Find(&result.Post.Tags)
	}
	if len(post.CategoryIDs) > 0 {
		config.DB.Model(&model.Category{}).Where(post.CategoryIDs).Find(&result.Post.Categories)
	}

	tx := config.DB.WithContext(context.WithValue(ctx, userContext, uID)).Begin()

	err = tx.Model(&model.Post{}).Create(&result.Post).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return nil, errorx.DBError()
	}

	tx.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").First(&result.Post)

	if result.Format.Slug == "fact-check" {
		// create post claim
		for _, id := range post.ClaimIDs {
			postClaim := &factCheckModel.PostClaim{}
			postClaim.ClaimID = uint(id)
			postClaim.PostID = result.ID

			err = tx.Model(&factCheckModel.PostClaim{}).Create(&postClaim).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				return nil, errorx.DBError()
			}
		}

		// fetch all post claims
		postClaims := []factCheckModel.PostClaim{}
		tx.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
			PostID: result.ID,
		}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&postClaims)

		// appending all post claims
		for _, postClaim := range postClaims {
			result.Claims = append(result.Claims, postClaim.Claim)
		}
	}

	// Adding author
	authors, err := author.All(ctx)

	if err != nil {
		loggerx.Error(err)
		return nil, errorx.InternalServerError()
	}

	for _, id := range post.AuthorIDs {
		aID := fmt.Sprint(id)
		if _, found := authors[aID]; found && id != 0 {
			author := model.PostAuthor{
				AuthorID: id,
				PostID:   result.Post.ID,
			}
			err := tx.Model(&model.PostAuthor{}).Create(&author).Error
			if err == nil {
				result.Authors = append(result.Authors, authors[aID])
			}
		}
	}

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":             result.ID,
		"kind":           "post",
		"title":          result.Title,
		"subtitle":       result.Subtitle,
		"slug":           result.Slug,
		"status":         result.Status,
		"excerpt":        result.Excerpt,
		"description":    result.Description,
		"is_featured":    result.IsFeatured,
		"is_sticky":      result.IsSticky,
		"is_highlighted": result.IsHighlighted,
		"format_id":      result.FormatID,
		"published_date": result.PublishedDate.Unix(),
		"space_id":       result.SpaceID,
		"tag_ids":        post.TagIDs,
		"category_ids":   post.CategoryIDs,
		"author_ids":     post.AuthorIDs,
	}

	if result.Format.Slug == "fact-check" {
		meiliObj["claim_ids"] = post.ClaimIDs
	}

	err = meilisearchx.AddDocument("dega", meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return nil, errorx.InternalServerError()
	}

	tx.Commit()

	if err = util.NC.Publish("post.created", result); err != nil {
		return nil, errorx.GetMessage("not able to publish event", http.StatusInternalServerError)
	}

	return result, errorx.Message{}
}
