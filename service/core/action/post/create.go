package post

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meili"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
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

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	post := post{}
	result := &postData{}
	result.Authors = make([]model.Author, 0)
	result.Claims = make([]factCheckModel.Claim, 0)

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

	var postSlug string
	if post.Slug != "" && slug.Check(post.Slug) {
		postSlug = post.Slug
	} else {
		postSlug = slug.Make(post.Title)
	}

	result.Post = model.Post{
		Title:            post.Title,
		Slug:             slug.Approve(postSlug, sID, config.DB.NewScope(&model.Post{}).TableName()),
		Status:           post.Status,
		Subtitle:         post.Subtitle,
		Excerpt:          post.Excerpt,
		Description:      post.Description,
		IsFeatured:       post.IsFeatured,
		IsHighlighted:    post.IsHighlighted,
		IsSticky:         post.IsSticky,
		FeaturedMediumID: post.FeaturedMediumID,
		FormatID:         post.FormatID,
		PublishedDate:    post.PublishedDate,
		SpaceID:          post.SpaceID,
	}

	config.DB.Model(&model.Tag{}).Where(post.TagIDs).Find(&result.Post.Tags)
	config.DB.Model(&model.Category{}).Where(post.CategoryIDs).Find(&result.Post.Categories)

	tx := config.DB.Begin()
	err = tx.Model(&model.Post{}).Set("gorm:association_autoupdate", false).Create(&result.Post).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").First(&result.Post)

	if result.Format.Slug == "factcheck" {
		// create post claim
		for _, id := range post.ClaimIDs {
			postClaim := &factCheckModel.PostClaim{}
			postClaim.ClaimID = uint(id)
			postClaim.PostID = result.ID

			err = tx.Model(&factCheckModel.PostClaim{}).Create(&postClaim).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
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
	authors, err := author.All(r.Context())

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	for _, id := range post.AuthorIDs {
		aID := fmt.Sprint(id)
		if _, found := authors[aID]; found {
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
		"published_date": result.PublishedDate.Unix(),
		"space_id":       result.SpaceID,
		"tag_ids":        post.TagIDs,
		"category_ids":   post.CategoryIDs,
	}

	err = meili.AddDocument(meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusCreated, result)
}
