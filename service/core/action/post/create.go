package post

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/validation"
	"github.com/factly/x/renderx"
	"github.com/go-playground/validator/v10"
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
		return
	}

	post := post{}
	result := &postData{}

	json.NewDecoder(r.Body).Decode(&post)

	validate := validator.New()

	err = validate.Struct(post)

	if err != nil {
		msg := err.Error()
		validation.ValidErrors(w, r, msg)
		return
	}

	post.SpaceID = uint(sID)

	result.Post = model.Post{
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
		FeaturedMediumID: post.FeaturedMediumID,
		FormatID:         post.FormatID,
		PublishedDate:    post.PublishedDate,
		SpaceID:          post.SpaceID,
	}

	// check categories, tags & medium belong to same space or not
	err = post.CheckSpace(config.DB)
	if err != nil {
		validation.Error(w, r, err.Error())
		return
	}

	err = config.DB.Model(&model.Post{}).Create(&result.Post).Error

	if err != nil {
		return
	}

	config.DB.Model(&model.Post{}).Preload("Medium").Preload("Format").Find(&result.Post)

	// create post category & fetch categories
	for _, id := range post.CategoryIDS {
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

	// create post tag & fetch tags
	for _, id := range post.TagIDS {
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

	renderx.JSON(w, http.StatusCreated, result)
}
