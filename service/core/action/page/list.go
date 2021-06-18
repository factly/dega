package page

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
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

	// Filters
	u, _ := url.Parse(r.URL.String())
	queryMap := u.Query()
	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")

	filters := generateFilters(queryMap["tag"], queryMap["category"], queryMap["author"], queryMap["status"])
	filteredPageIDs := make([]uint, 0)

	if filters != "" {
		filters = fmt.Sprint(filters, " AND space_id=", sID)
	}

	result := paging{}
	result.Nodes = make([]pageData, 0)

	if filters != "" || searchQuery != "" {
		// Search pages with filter
		var hits []interface{}
		var res map[string]interface{}

		if searchQuery != "" {
			hits, err = meilisearchx.SearchWithQuery("dega", searchQuery, filters, "page")
		} else {
			res, err = meilisearchx.SearchWithoutQuery("dega", filters, "page")
			if _, found := res["hits"]; found {
				hits = res["hits"].([]interface{})
			}
		}
		if err != nil {
			loggerx.Error(err)
			renderx.JSON(w, http.StatusOK, result)
			return
		}

		filteredPageIDs = meilisearchx.GetIDArray(hits)
		if len(filteredPageIDs) == 0 {
			renderx.JSON(w, http.StatusOK, result)
			return
		}
	}

	posts := make([]model.Post, 0)
	offset, limit := paginationx.Parse(r.URL.Query())

	if sort != "asc" {
		sort = "desc"
	}

	tx := config.DB.Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Model(&model.Post{}).Where(&model.Post{
		SpaceID: uint(sID),
	}).Where("is_page = ?", true).Order("created_at " + sort)

	formatIDs := make([]uint, 0)
	for _, fid := range queryMap["format"] {
		fidStr, _ := strconv.Atoi(fid)
		formatIDs = append(formatIDs, uint(fidStr))
	}

	if len(formatIDs) > 0 {
		tx.Where("format_id IN (?)", formatIDs)
	}

	if len(filteredPageIDs) > 0 {
		err = tx.Where(filteredPageIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&posts).Error
	} else {
		err = tx.Where("status != ?", "template").Count(&result.Total).Offset(offset).Limit(limit).Find(&posts).Error
	}

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

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
func generateFilters(tagIDs, categoryIDs, authorIDs, status []string) string {
	filters := ""
	if len(tagIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(tagIDs, "tag_ids"), " AND ")
	}

	if len(categoryIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(categoryIDs, "category_ids"), " AND ")
	}

	if len(authorIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(authorIDs, "author_ids"), " AND ")
	}

	if len(status) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(status, "status"), " AND ")
	}

	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}
