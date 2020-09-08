package post

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/arrays"
	"github.com/factly/dega-server/util/meili"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

// update - Update post by id
// @Summary Update a post by id
// @Description Update post by ID
// @Tags Post
// @ID update-post-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param post_id path string true "Post ID"
// @Param Post body post false "Post"
// @Success 200 {object} postData
// @Router /core/posts/{post_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	postID := chi.URLParam(r, "post_id")
	id, err := strconv.Atoi(postID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	post := &post{}
	postAuthors := []model.PostAuthor{}
	postClaims := []factCheckModel.PostClaim{}

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

	result := &postData{}
	result.ID = uint(id)
	result.Authors = make([]model.Author, 0)
	result.Claims = make([]factCheckModel.Claim, 0)

	// fetch all authors
	authors, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// check record exists or not
	err = config.DB.Where(&model.Post{
		SpaceID: uint(sID),
	}).Preload("Tags").Preload("Categories").First(&result.Post).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// Fetching old and new tags related to post
	oldTags := result.Post.Tags
	newTags := make([]model.Tag, 0)
	config.DB.Model(&model.Tag{}).Where(post.TagIDs).Find(&newTags)

	// Fetching old and new categories related to post
	oldCategories := result.Post.Categories
	newCategories := make([]model.Category, 0)
	config.DB.Model(&model.Category{}).Where(post.CategoryIDs).Find(&newCategories)

	post.SpaceID = result.SpaceID

	var postSlug string

	if result.Slug == post.Slug {
		postSlug = result.Slug
	} else if post.Slug != "" && slug.Check(post.Slug) {
		postSlug = slug.Approve(post.Slug, sID, config.DB.NewScope(&model.Post{}).TableName())
	} else {
		postSlug = slug.Approve(slug.Make(post.Title), sID, config.DB.NewScope(&model.Post{}).TableName())
	}

	tx := config.DB.Begin()
	// Deleting old associations
	if len(oldTags) > 0 {
		err = tx.Model(&result.Post).Association("Tags").Delete(oldTags).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}
	if len(oldCategories) > 0 {
		err = tx.Model(&result.Post).Association("Categories").Delete(oldCategories).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	if len(newTags) == 0 {
		newTags = nil
	}
	if len(newCategories) == 0 {
		newCategories = nil
	}

	if post.FeaturedMediumID == 0 {
		err = tx.Model(result.Post).Updates(map[string]interface{}{"featured_medium_id": nil}).First(&result.Post).Error
		result.FeaturedMediumID = 0
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	err = tx.Model(&result.Post).Set("gorm:association_autoupdate", false).Updates(model.Post{
		Title:            post.Title,
		Slug:             postSlug,
		Status:           post.Status,
		Subtitle:         post.Subtitle,
		Excerpt:          post.Excerpt,
		Description:      post.Description,
		IsFeatured:       post.IsFeatured,
		IsHighlighted:    post.IsHighlighted,
		IsSticky:         post.IsSticky,
		FormatID:         post.FormatID,
		FeaturedMediumID: post.FeaturedMediumID,
		PublishedDate:    post.PublishedDate,
		Tags:             newTags,
		Categories:       newCategories,
	}).Preload("Medium").Preload("Format").First(&result.Post).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// fetch existing post authors
	config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: uint(id),
	}).Find(&postAuthors)

	var toCreateIDs []uint
	var toDeleteIDs []uint

	if result.Post.Format.Slug == "factcheck" {
		// fetch existing post claims
		config.DB.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
			PostID: uint(id),
		}).Find(&postClaims)

		prevClaimIDs := make([]uint, 0)
		mapperPostClaim := map[uint]factCheckModel.PostClaim{}
		postClaimIDs := make([]uint, 0)

		for _, postClaim := range postClaims {
			mapperPostClaim[postClaim.ClaimID] = postClaim
			prevClaimIDs = append(prevClaimIDs, postClaim.ClaimID)
		}

		toCreateIDs, toDeleteIDs = arrays.Difference(prevClaimIDs, post.ClaimIDs)

		// map post claim ids
		for _, id := range toDeleteIDs {
			postClaimIDs = append(postClaimIDs, mapperPostClaim[id].ID)
		}

		// delete post claims
		if len(postClaimIDs) > 0 {
			err = tx.Where(postClaimIDs).Delete(factCheckModel.PostClaim{}).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		}

		for _, id := range toCreateIDs {
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

		// fetch updated post claims
		updatedPostClaims := []factCheckModel.PostClaim{}
		tx.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
			PostID: uint(id),
		}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&updatedPostClaims)

		// appending previous post claims to result
		for _, postClaim := range updatedPostClaims {
			result.Claims = append(result.Claims, postClaim.Claim)
		}

	}

	prevAuthorIDs := make([]uint, 0)
	mapperPostAuthor := map[uint]model.PostAuthor{}
	postAuthorIDs := make([]uint, 0)

	for _, postAuthor := range postAuthors {
		mapperPostAuthor[postAuthor.AuthorID] = postAuthor
		prevAuthorIDs = append(prevAuthorIDs, postAuthor.AuthorID)
	}

	toCreateIDs, toDeleteIDs = arrays.Difference(prevAuthorIDs, post.AuthorIDs)

	// map post author ids
	for _, id := range toDeleteIDs {
		postAuthorIDs = append(postAuthorIDs, mapperPostAuthor[id].ID)
	}

	// delete post authors
	if len(postAuthorIDs) > 0 {
		err = tx.Where(postAuthorIDs).Delete(model.PostAuthor{}).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// creating new post authors
	for _, id := range toCreateIDs {
		postAuthor := &model.PostAuthor{}
		postAuthor.AuthorID = uint(id)
		postAuthor.PostID = result.ID

		err = tx.Model(&model.PostAuthor{}).Create(&postAuthor).Error

		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// fetch existing post authors
	updatedPostAuthors := []model.PostAuthor{}
	config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: uint(id),
	}).Find(&updatedPostAuthors)

	// appending previous post authors to result
	for _, postAuthor := range updatedPostAuthors {
		aID := fmt.Sprint(postAuthor.AuthorID)

		if author, found := authors[aID]; found {
			result.Authors = append(result.Authors, author)
		}
	}

	// Update into meili index
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
	}

	if result.Format.Slug == "factcheck" {
		meiliObj["claim_ids"] = post.ClaimIDs
	}

	err = meili.UpdateDocument(meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	tx.Commit()
	renderx.JSON(w, http.StatusOK, result)
}
