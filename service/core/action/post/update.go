package post

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/errors"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/renderx"
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
		errors.Parser(w, r, errors.InvalidID, 404)
		return
	}

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errors.Parser(w, r, errors.InternalServerError, 500)
		return
	}

	post := &post{}
	categories := []model.PostCategory{}
	tags := []model.PostTag{}
	postAuthors := []model.PostAuthor{}

	err = json.NewDecoder(r.Body).Decode(&post)

	errors.Parser(w, r, err.Error(), 422)

	result := &postData{}
	result.ID = uint(id)
	result.Tags = make([]model.Tag, 0)
	result.Categories = make([]model.Category, 0)
	result.Authors = make([]model.Author, 0)

	// fetch all authors
	authors, err := author.All(r.Context())

	// check record exists or not
	err = config.DB.Where(&model.Post{
		SpaceID: uint(sID),
	}).First(&result.Post).Error

	if err != nil {
		errors.Parser(w, r, err.Error(), 404)
		return
	}

	post.SpaceID = result.SpaceID

	err = post.CheckSpace(config.DB)

	if err != nil {
		errors.Parser(w, r, err.Error(), 404)
		return
	}

	var postSlug string

	if result.Slug == post.Slug {
		postSlug = result.Slug
	} else if post.Slug != "" && slug.Check(post.Slug) {
		postSlug = slug.Approve(post.Slug, sID, config.DB.NewScope(&model.Post{}).TableName())
	} else {
		postSlug = slug.Approve(slug.Make(post.Title), sID, config.DB.NewScope(&model.Post{}).TableName())
	}

	config.DB.Model(&result.Post).Updates(model.Post{
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

	// fetch all authors
	config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: uint(id),
	}).Find(&postAuthors)

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

	// delete post authors
	for _, a := range postAuthors {
		present := false
		for _, id := range post.AuthorIDS {
			if a.AuthorID == id {
				present = true
			}
		}
		if present == false {
			config.DB.Where(&model.PostAuthor{
				AuthorID: a.AuthorID,
				PostID:   uint(id),
			}).Delete(model.PostAuthor{})
		}
	}

	// creating new post authors
	for _, id := range post.AuthorIDS {
		present := false
		for _, postAuthor := range postAuthors {
			if postAuthor.AuthorID == id {
				present = true
				aID := fmt.Sprint(postAuthor.AuthorID)

				if authors[aID].Email != "" {
					result.Authors = append(result.Authors, authors[aID])
				}
			}
		}
		if present == false {
			postAuthor := &model.PostAuthor{}
			postAuthor.AuthorID = uint(id)
			postAuthor.PostID = result.ID

			err = config.DB.Model(&model.PostAuthor{}).Create(&postAuthor).Error

			if err != nil {
				return
			}
			aID := fmt.Sprint(postAuthor.AuthorID)

			if authors[aID].Email != "" {
				result.Authors = append(result.Authors, authors[aID])
			}
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
