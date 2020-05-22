package post

import (
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

// list - Get all posts
// @Summary Show all posts
// @Description Get all posts
// @Tags Post
// @ID get-all-posts
// @Produce  json
// @Param X-User header string true "User ID"
// @Success 200 {array} postData
// @Router /core/posts [get]
func list(w http.ResponseWriter, r *http.Request) {
	fmt.Print("list")
	result := []postData{}
	posts := []model.Post{}

	err := config.DB.Model(&model.Post{}).Preload("Medium").Preload("Format").Find(&posts).Error

	if err != nil {
		return
	}
	fmt.Print(len(posts))
	for _, post := range posts {
		postList := &postData{}
		categories := []model.PostCategory{}
		tags := []model.PostTag{}

		postList.Post = post

		// fetch all categories
		config.DB.Model(&model.PostCategory{}).Where(&model.PostCategory{
			PostID: post.ID,
		}).Preload("Category").Preload("Category.Medium").Find(&categories)

		// fetch all tags
		config.DB.Model(&model.PostTag{}).Where(&model.PostTag{
			PostID: post.ID,
		}).Preload("Tag").Find(&tags)

		for _, c := range categories {
			postList.Categories = append(postList.Categories, c.Category)
		}

		for _, t := range tags {
			postList.Tags = append(postList.Tags, t.Tag)
		}

		result = append(result, *postList)
	}

	render.JSON(w, http.StatusOK, result)
}
