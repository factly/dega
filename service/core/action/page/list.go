package page

import (
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

type paging struct {
	Total int64      `json:"total"`
	Nodes []pageData `json:"nodes"`
}

// list - Get all pages
// @Summary Show all pages
// @Description Get all pages
// @Tags Page
// @ID get-all-pages
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Param sort query string false "sort"
// @Success 200 {array} pageData
// @Router /core/pages [get]
func list(w http.ResponseWriter, r *http.Request) {
	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	sort := r.URL.Query().Get("sort")

	result := paging{}
	result.Nodes = make([]pageData, 0)

	posts := make([]model.Post, 0)
	offset, limit := paginationx.Parse(r.URL.Query())

	if sort != "asc" {
		sort = "desc"
	}

	config.DB.Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Model(&model.Post{}).Where(&model.Post{
		SpaceID: uint(sID),
	}).Where("is_page = ?", true).Order("created_at " + sort).Count(&result.Total).Offset(offset).Limit(limit).Find(&posts)

	var postIDs []uint
	for _, p := range posts {
		postIDs = append(postIDs, p.ID)
	}

	// fetch all authors
	authors, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// fetch all authors related to posts
	postAuthors := []model.PostAuthor{}
	config.DB.Model(&model.PostAuthor{}).Where("post_id in (?)", postIDs).Find(&postAuthors)

	postAuthorMap := make(map[uint][]uint)
	for _, po := range postAuthors {
		if _, found := postAuthorMap[po.PostID]; !found {
			postAuthorMap[po.PostID] = make([]uint, 0)
		}
		postAuthorMap[po.PostID] = append(postAuthorMap[po.PostID], po.AuthorID)
	}

	for _, post := range posts {
		pageList := &pageData{}
		pageList.Authors = make([]model.Author, 0)
		pageList.Post = post

		postAuthors, hasEle := postAuthorMap[post.ID]

		if hasEle {
			for _, postAuthor := range postAuthors {
				aID := fmt.Sprint(postAuthor)
				if author, found := authors[aID]; found {
					pageList.Authors = append(pageList.Authors, author)
				}
			}
		}

		result.Nodes = append(result.Nodes, *pageList)
	}

	renderx.JSON(w, http.StatusOK, result)
}
