package post

import (
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	factcheckModel "github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
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
// @Param format query string false "format type"
// @Success 200 {array} postData
// @Router /core/posts [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if err != nil {
		return
	}

	tx := config.DB.Preload("Medium").Preload("Format").Model(&model.Post{})

	format := chi.URLParam(r, "format")
	if format == "factcheck" {
		tx = tx.Where(&model.Post{
			SpaceID: uint(sID),
			Format: &model.Format{
				Slug: "factcheck",
			},
		})
	} else {
		tx = tx.Where(&model.Post{
			SpaceID: uint(sID),
			Format: &model.Format{
				Slug: "article",
			},
		})
	}

	result := paging{}
	result.Nodes = make([]postData, 0)

	posts := make([]model.Post, 0)

	offset, limit := paginationx.Parse(r.URL.Query())

	tx.Count(&result.Total).Order("id desc").Offset(offset).Limit(limit).Find(&posts)

	// fetch all authors
	authors, err := author.All(r.Context())

	for _, post := range posts {
		postList := &postData{}
		categories := []model.PostCategory{}
		tags := []model.PostTag{}
		postAuthors := []model.PostAuthor{}
		postClaims := []factcheckModel.PostClaim{}

		postList.Categories = make([]model.Category, 0)
		postList.Tags = make([]model.Tag, 0)
		postList.Authors = make([]model.Author, 0)

		postList.Post = post

		if format == "factcheck" {
			postList.Claims = make([]factcheckModel.Claim, 0)

			config.DB.Model(&factcheckModel.PostClaim{}).Where(&factcheckModel.PostClaim{
				PostID: post.ID,
			}).Preload("Claim").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Find(&postClaims)

			// appending all post claims
			for _, postClaim := range postClaims {
				postList.Claims = append(postList.Claims, postClaim.Claim)
			}
		}

		// fetch all categories
		config.DB.Model(&model.PostCategory{}).Where(&model.PostCategory{
			PostID: post.ID,
		}).Preload("Category").Preload("Category.Medium").Find(&categories)

		// fetch all tags
		config.DB.Model(&model.PostTag{}).Where(&model.PostTag{
			PostID: post.ID,
		}).Preload("Tag").Find(&tags)

		// fetch all post authors
		config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
			PostID: post.ID,
		}).Find(&postAuthors)

		for _, c := range categories {
			if c.Category.ID != 0 {
				postList.Categories = append(postList.Categories, c.Category)
			}
		}

		for _, t := range tags {
			if t.Tag.ID != 0 {
				postList.Tags = append(postList.Tags, t.Tag)
			}
		}

		for _, postAuthor := range postAuthors {
			aID := fmt.Sprint(postAuthor.AuthorID)
			if authors[aID].Email != "" {
				postList.Authors = append(postList.Authors, authors[aID])
			}
		}

		result.Nodes = append(result.Nodes, *postList)
	}

	renderx.JSON(w, http.StatusOK, result)
}
