package post

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
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
// @Param space_id path string true "Space ID"
// @Param post_id path string true "Post ID"
// @Param Post body post false "Post"
// @Success 200 {object} postData
// @Router /{space_id}/core/posts/{post_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	postID := chi.URLParam(r, "post_id")
	id, err := strconv.Atoi(postID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	if err != nil {
		return
	}

	post := &post{}
	categories := []model.PostCategory{}
	tags := []model.PostTag{}

	json.NewDecoder(r.Body).Decode(&post)

	result := &postData{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Post{
		SpaceID: uint(sid),
	}).First(&result.Post).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	post.SpaceID = result.SpaceID

	err = post.BeforeCreate(config.DB)

	if err != nil {
		validation.Error(w, r, err.Error())
		return
	}

	config.DB.Model(&result.Post).Updates(model.Post{
		Title:            post.Title,
		Slug:             post.Slug,
		Status:           post.Status,
		Subtitle:         post.Subtitle,
		Excerpt:          post.Excerpt,
		Updates:          post.Updates,
		Description:      post.Description,
		IsFeatured:       post.IsFeatured,
		IsHighlighted:    post.IsHighlighted,
		IsSticky:         post.IsSticky,
		FormatID:         post.FormatID,
		FeaturedMediumID: post.FeaturedMediumID,
		PublishedDate:    post.PublishedDate,
	})

	config.DB.Model(&model.Post{}).Preload("Medium").Preload("Format").First(&result.Post)

	// fetch all categories
	config.DB.Model(&model.PostCategory{}).Where(&model.PostCategory{
		PostID: uint(id),
	}).Preload("Category").Preload("Category.Medium").Find(&categories)

	// fetch all tags
	config.DB.Model(&model.PostTag{}).Where(&model.PostTag{
		PostID: uint(id),
	}).Preload("Tag").Find(&tags)

	// delete tags
	for _, t := range tags {
		present := false
		for _, id := range post.TagIDS {
			if t.TagID == id {
				present = true
			}
		}
		if present == false {
			config.DB.Where(&model.PostTag{
				TagID:  t.TagID,
				PostID: uint(id),
			}).Delete(model.PostTag{})
		}
	}

	// creating new tags
	for _, id := range post.TagIDS {
		present := false
		for _, t := range tags {
			if t.TagID == id {
				present = true
				result.Tags = append(result.Tags, t.Tag)
			}
		}
		if present == false {
			postTag := &model.PostTag{}
			postTag.TagID = uint(id)
			postTag.PostID = result.ID

			err = config.DB.Model(&model.PostTag{}).Create(&postTag).Error

			if err != nil {
				return
			}
			config.DB.Model(&model.PostTag{}).Preload("Tag").First(&postTag)
			result.Tags = append(result.Tags, postTag.Tag)
		}
	}

	// delete categories
	for _, c := range categories {
		present := false
		for _, id := range post.CategoryIDS {
			if c.CategoryID == id {
				present = true
			}
		}
		if present == false {
			config.DB.Where(&model.PostCategory{
				CategoryID: c.CategoryID,
				PostID:     uint(id),
			}).Delete(model.PostCategory{})
		}
	}

	// creating new categories
	for _, id := range post.CategoryIDS {
		present := false
		for _, c := range categories {
			if c.CategoryID == id {
				present = true
				result.Categories = append(result.Categories, c.Category)
			}
		}
		if present == false {
			postCategory := &model.PostCategory{}
			postCategory.CategoryID = uint(id)
			postCategory.PostID = result.ID

			err = config.DB.Model(&model.PostCategory{}).Create(&postCategory).Error

			if err != nil {
				return
			}

			config.DB.Model(&model.PostCategory{}).Preload("Category").Preload("Category.Medium").First(&postCategory)
			result.Categories = append(result.Categories, postCategory.Category)
		}
	}

	render.JSON(w, http.StatusOK, result)
}
