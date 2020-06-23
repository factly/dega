package post

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int        `json:"total"`
	Nodes []postData `json:"nodes"`
}

// list - Get all posts
// @Summary Show all posts
// @Description Get all posts
// @Tags Post
// @ID get-all-posts
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {array} postData
// @Router /core/posts [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())

	result := paging{}
	posts := make([]model.Post, 0)

	offset, limit := paginationx.Parse(r.URL.Query())

	err = config.DB.Model(&model.Post{}).Preload("Medium").Preload("Format").Where(&model.Post{
		SpaceID: uint(sID),
	}).Count(&result.Total).Order("id desc").Offset(offset).Limit(limit).Find(&posts).Error

	if err != nil {
		return
	}

	for _, post := range posts {
		postList := &postData{}
		categories := []model.PostCategory{}
		tags := []model.PostTag{}
		postList.Categories = make([]model.Category, 0)
		postList.Tags = make([]model.Tag, 0)

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

		result.Nodes = append(result.Nodes, *postList)
	}

	renderx.JSON(w, http.StatusOK, result)
}
