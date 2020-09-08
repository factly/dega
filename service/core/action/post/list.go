package post

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meili"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
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
// @Param tag query string false "Tags"
// @Param format query string false "Format"
// @Param author query string false "Author"
// @Param q query string false "Query"
// @Param sort query string false "Sort"
// @Param category query string false "Category"
// @Success 200 {array} postData
// @Router /core/posts [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// Filters
	filterTagIDs := r.URL.Query().Get("tag")
	filterCategoryIDs := r.URL.Query().Get("category")
	filterAuthorIDs := r.URL.Query().Get("author")
	filterFormatIDs := r.URL.Query().Get("format")
	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")

	filters := generateFilters(filterTagIDs, filterCategoryIDs, filterAuthorIDs, filterFormatIDs)
	filteredPostIDs := make([]uint, 0)

	if filters != "" {
		filters = fmt.Sprint(filters, " AND space_id=", sID)

		// Search posts with filter
		var hits []interface{}
		var result map[string]interface{}

		if searchQuery != "" {
			hits, err = meili.SearchWithQuery(searchQuery, filters, "post")
		} else {
			result, err = meili.SearchWithoutQuery(filters, "post")
			hits = result["hits"].([]interface{})
		}
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}

		filteredPostIDs = meili.GetIDArray(hits)
		if len(filteredPostIDs) == 0 {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
			return
		}
	}

	result := paging{}
	result.Nodes = make([]postData, 0)

	posts := make([]model.Post, 0)

	offset, limit := paginationx.Parse(r.URL.Query())

	if sort != "asc" {
		sort = "desc"
	}

	tx := config.DB.Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Model(&model.Post{}).Where(&model.Post{
		SpaceID: uint(sID),
	}).Count(&result.Total).Order("created_at " + sort).Offset(offset).Limit(limit)

	if len(filteredPostIDs) > 0 {
		err = tx.Where(filteredPostIDs).Find(&posts).Error
	} else {
		err = tx.Find(&posts).Error
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

	// fetch all claims related to posts
	postClaims := []factCheckModel.PostClaim{}
	config.DB.Model(&factCheckModel.PostClaim{}).Where("post_id in (?)", postIDs).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&postClaims)

	postClaimMap := make(map[uint][]factCheckModel.Claim)
	for _, pc := range postClaims {
		if _, found := postClaimMap[pc.PostID]; !found {
			postClaimMap[pc.PostID] = make([]factCheckModel.Claim, 0)
		}
		postClaimMap[pc.PostID] = append(postClaimMap[pc.PostID], pc.Claim)
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
		postList := &postData{}
		postList.Claims = make([]factCheckModel.Claim, 0)
		postList.Authors = make([]model.Author, 0)
		if len(postClaimMap[post.ID]) > 0 {
			postList.Claims = postClaimMap[post.ID]
		}
		postList.Post = post

		postAuthors, hasEle := postAuthorMap[post.ID]

		if hasEle {
			for _, postAuthor := range postAuthors {
				aID := fmt.Sprint(postAuthor)
				if author, found := authors[aID]; found {
					postList.Authors = append(postList.Authors, author)
				}
			}
		}

		result.Nodes = append(result.Nodes, *postList)
	}

	renderx.JSON(w, http.StatusOK, result)
}

func generateFilters(tagIDs, categoryIDs, authorIDs, formatID string) string {
	if tagIDs == "" && categoryIDs == "" && formatID == "" && authorIDs == "" {
		return ""
	}

	filters := ""
	if tagIDs != "" {
		tagsArr := strings.Split(tagIDs, ",")
		for _, tag := range tagsArr {
			filters = fmt.Sprint(filters, "tag_ids=", tag, " AND ")
		}
	}

	if categoryIDs != "" {
		categoriesArr := strings.Split(categoryIDs, ",")
		for _, cat := range categoriesArr {
			filters = fmt.Sprint(filters, "category_ids=", cat, " AND ")
		}
	}

	if authorIDs != "" {
		authorArr := strings.Split(authorIDs, ",")
		for _, author := range authorArr {
			filters = fmt.Sprint(filters, "author_ids=", author, " AND ")
		}
	}

	if formatID != "" {
		filters = fmt.Sprint(filters, "format_id=", formatID)
	}

	if filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}
