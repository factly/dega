package post

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/test/models"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/arrays"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// list response
type paging struct {
	Total int64      `json:"total"`
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
// @Param status query string false "Status"
// @Success 200 {array} postData
// @Router /core/posts [get]
func list(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
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

	result := paging{}
	result.Nodes = make([]postData, 0)
	posts := make([]model.Post, 0)

	offset, limit := paginationx.Parse(r.URL.Query())
	if sort != "asc" {
		sort = "desc"
	}

	tx := config.DB.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Where(&model.Post{
		SpaceID: authCtx.SpaceID,
	}).Where("is_page = ?", false)
	var statusTemplate bool = false
	for _, status := range queryMap["status"] {
		if status == "template" {
			statusTemplate = true
			break
		}
	}

	formatIDs := make([]uuid.UUID, 0)
	for _, fid := range queryMap["format"] {
		fidStr, _ := uuid.Parse(fid)
		formatIDs = append(formatIDs, fidStr)
	}

	if len(formatIDs) > 0 {
		tx.Where("format_id IN (?)", formatIDs)
	}

	filters := generateFilters(queryMap["tag"], queryMap["category"], queryMap["author"], queryMap["status"])
	if filters != "" || searchQuery != "" {

		if config.SearchEnabled() {
			if filters != "" {
				filters = fmt.Sprint(filters, " AND space_id=", authCtx.SpaceID)
			}
			// Search posts with filter
			var hits []interface{}
			hits, err = meilisearch.SearchWithQuery("post", searchQuery, filters)
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.NetworkError()))
				return
			}

			filteredPostIDs := meilisearch.GetIDArray(hits)
			if len(filteredPostIDs) == 0 {
				renderx.JSON(w, http.StatusOK, result)
				return
			} else {
				// filtered post ids from meili
				if !statusTemplate {
					tx.Where("status != ?", "template")
				}
				err = tx.Where(filteredPostIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&posts).Error
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.DBError()))
					return
				}
			}
		} else {
			// generate sql filter query
			if !statusTemplate {
				tx.Where("status != ?", "template")
			}
			filters = generateSQLFilters(tx, searchQuery, queryMap["tag"], queryMap["category"], queryMap["author"], queryMap["status"])
			err = tx.Where(filters).Count(&result.Total).Offset(offset).Limit(limit).Select("posts.*").Find(&posts).Error
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		}
	} else {
		// return all
		err = tx.Where("status != ?", "template").Order("created_at " + sort).Count(&result.Total).Offset(offset).Limit(limit).Find(&posts).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	tx.Commit()

	var postIDs []uuid.UUID
	for _, p := range posts {
		postIDs = append(postIDs, p.ID)
	}

	// fetch all claims related to posts
	postClaims := []factCheckModel.PostClaim{}
	config.DB.Model(&factCheckModel.PostClaim{}).Where("post_id in (?)", postIDs).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&postClaims)

	postClaimMap := make(map[uuid.UUID][]factCheckModel.PostClaim)
	for _, pc := range postClaims {
		if _, found := postClaimMap[pc.PostID]; !found {
			postClaimMap[pc.PostID] = make([]factCheckModel.PostClaim, 0)
		}
		postClaimMap[pc.PostID] = append(postClaimMap[pc.PostID], pc)
	}

	// fetch all authors related to posts
	postAuthors := []model.PostAuthor{}
	config.DB.Model(&model.PostAuthor{}).Where("post_id in (?)", postIDs).Find(&postAuthors)

	authorIDs := make([]string, 0)

	for _, postAuthor := range postAuthors {
		authorIDs = append(authorIDs, postAuthor.AuthorID)
	}

	// fetch all authors
	authors, err := util.GetAuthors(r.Header.Get("Authorization"), authCtx.OrganisationID, authorIDs)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	postAuthorMap := make(map[uuid.UUID][]string)
	for _, po := range postAuthors {
		if _, found := postAuthorMap[po.PostID]; !found {
			postAuthorMap[po.PostID] = make([]string, 0)
		}
		postAuthorMap[po.PostID] = append(postAuthorMap[po.PostID], po.AuthorID)
	}

	for _, post := range posts {
		postList := &postData{}
		postList.Claims = make([]factCheckModel.Claim, 0)
		postList.Authors = make([]model.Author, 0)
		if len(postClaimMap[post.ID]) > 0 {
			postList.ClaimOrder = make([]uuid.UUID, len(postClaimMap[post.ID]))
			for _, postCla := range postClaimMap[post.ID] {
				postList.Claims = append(postList.Claims, postCla.Claim)
				postList.ClaimOrder[int(postCla.Position-1)] = postCla.ClaimID
			}
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

func PublicList(w http.ResponseWriter, r *http.Request) {
	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	sortBy := r.URL.Query().Get("sort_by")
	sortOrder := r.URL.Query().Get("sort_order")
	formatIDs := r.URL.Query()["format_ids"]
	metafieldsKey := r.URL.Query().Get("meta_fields_key")
	metafieldsValue := r.URL.Query().Get("meta_fields_value")

	formatUUIDs, err := arrays.StrToUUID(formatIDs)
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	formatSlugs := r.URL.Query()["format_slugs"]
	tagIds := r.URL.Query()["tag_ids"]

	tagUUIDs, err := arrays.StrToUUID(tagIds)
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	tagSlugs := r.URL.Query()["tag_slugs"]
	categoryIds := r.URL.Query()["category_ids"]

	categoryUUIDs, err := arrays.StrToUUID(categoryIds)
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	categorySlugs := r.URL.Query()["category_slugs"]

	status := r.URL.Query().Get("status")

	if len(tagSlugs) > 0 {
		tags := make([]model.Tag, 0)
		config.DB.Model(&model.Tag{}).Where("slug IN ? and space_id", tagSlugs, authCtx.SpaceID).Find(&tags)

		tagUUIDs = make([]uuid.UUID, 0)
		for _, tag := range tags {
			tagUUIDs = append(tagUUIDs, tag.ID)
		}
	}

	if len(categorySlugs) > 0 {
		categories := make([]model.Category, 0)
		config.DB.Model(&model.Category{}).Where("slug IN ? and space_id", categorySlugs, authCtx.SpaceID).Find(&categories)

		for _, category := range categories {
			categoryUUIDs = append(categoryUUIDs, category.ID)
		}
	}

	if len(formatSlugs) > 0 {
		formats := make([]model.Format, 0)
		config.DB.Model(&model.Format{}).Where("slug IN ? and space_id", formatSlugs, authCtx.SpaceID).Find(&formats)

		for _, format := range formats {
			formatUUIDs = append(formatUUIDs, format.ID)
		}
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	columns := []string{"created_at", "updated_at", "name", "slug"}
	pageSortBy := "created_at"
	pageSortOrder := "desc"

	if sortOrder != "" && sortOrder == "asc" {
		pageSortOrder = "asc"
	}

	if sortBy != "" && arrays.ColumnValidator(sortBy, columns) {
		pageSortBy = sortBy
	}

	result := paging{
		Total: 0,
		Nodes: make([]postData, 0),
	}

	order := "de_post." + pageSortBy + " " + pageSortOrder

	tx := config.DB.Model(&models.Post{}).Where("is_page = ?", false)

	if status != "" {
		tx.Where("status = ?", status)
	} else {
		tx.Where("status = ?", "publish")
	}

	userIDs := make([]string, 0)
	// get user ids if slugs provided

	filterStr := ""
	if len(categoryIds) > 0 || len(categorySlugs) > 0 {
		tx.Joins("INNER JOIN de_post_categories ON de_post_categories.post_id = posts.id")
		if len(categoryIds) > 0 {
			filterStr = filterStr + fmt.Sprint("de_post_categories.category_id IN (", strings.Trim(strings.Replace(fmt.Sprint(categoryIds), " ", ",", -1), "[]"), ") AND ")
		} else if len(categorySlugs) > 0 {
			tx.Joins("INNER JOIN de_category ON de_post_categories.category_id = categories.id")
			filterStr = filterStr + fmt.Sprint("de_category.slug IN (", createFilters(categorySlugs), ") AND ")
		}
	}

	if len(userIDs) > 0 {
		tx.Joins("INNER JOIN de_post_author ON de_post_author.post_id = de_post.id")
		filterStr = filterStr + fmt.Sprint("de_post_author.author_id IN (", strings.Trim(strings.Replace(fmt.Sprint(userIDs), " ", ",", -1), "[]"), ") AND ")
	}

	if len(tagIds) > 0 || len(tagSlugs) > 0 {
		tx.Joins("INNER JOIN de_post_tags ON de_post_tags.post_id = posts.id")
		if len(tagIds) > 0 {
			filterStr = filterStr + fmt.Sprint("de_post_tags.tag_id IN (", strings.Trim(strings.Replace(fmt.Sprint(tagIds), " ", ",", -1), "[]"), ") AND ")
		} else if len(tagSlugs) > 0 {
			tx.Joins("INNER JOIN de_tags ON de_post_tags.tag_id = tags.id")
			filterStr = filterStr + fmt.Sprint("de_tags.slug IN (", createFilters(tagSlugs), ") AND ")
		}
	}

	if len(formatIDs) > 0 || len(formatSlugs) > 0 {
		if len(formatIDs) > 0 {
			filterStr = filterStr + fmt.Sprint("de_post.format_id IN (", strings.Trim(strings.Replace(fmt.Sprint(formatIDs), " ", ",", -1), "[]"), ") AND ")
		} else if len(formatSlugs) > 0 {
			tx.Joins("INNER JOIN de_format ON de_post.format_id = de_format.id")
			filterStr = filterStr + fmt.Sprint("de_format.slug IN (", createFilters(formatSlugs), ") AND ")
		}
	}

	if metafieldsKey != "" && metafieldsValue != "" {
		tx.Model(&model.Post{}).Where("meta_fields @> ?", fmt.Sprintf(`{"%s": "%s"}`, metafieldsKey, metafieldsValue))
	}

	tx.Group("de_post.id")
	filterStr = strings.Trim(filterStr, " AND")
	tx.Where(&model.Post{
		SpaceID: authCtx.SpaceID,
	}).Where(filterStr).Count(&result.Total).Offset(offset).Limit(limit).Order(order).Select("de_post.*").Find(&result.Nodes)

	tx.Commit()

	renderx.JSON(w, http.StatusOK, result)

}

func createFilters(arr []string) string {
	filter := strings.Trim(strings.Replace(fmt.Sprint(arr), " ", "','", -1), "[]")
	filter = "'" + filter + "'"
	return filter
}

func generateFilters(tagIDs, categoryIDs, authorIDs, status []string) string {
	filters := ""
	if len(tagIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearch.GenerateFieldFilter(tagIDs, "tag_ids"), " AND ")
	}

	if len(categoryIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearch.GenerateFieldFilter(categoryIDs, "category_ids"), " AND ")
	}

	if len(authorIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearch.GenerateFieldFilter(authorIDs, "author_ids"), " AND ")
	}

	if len(status) > 0 {
		filters = fmt.Sprint(filters, meilisearch.GenerateFieldFilter(status, "status"), " AND ")
	}

	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}

func generateSQLFilters(tx *gorm.DB, searchQuery string, tagIDs, categoryIDs, authorIDs, status []string) string {
	filters := ""
	if config.Sqlite() {
		if searchQuery != "" {
			filters = fmt.Sprint(filters, "title LIKE '%", strings.ToLower(searchQuery), "%' ",
				"OR subtitle LIKE '%", strings.ToLower(searchQuery), "%' ",
				"OR excerpt LIKE '%", strings.ToLower(searchQuery), "%' ")
		}
	} else {
		if searchQuery != "" {
			filters = fmt.Sprint(filters, "title ILIKE '%", strings.ToLower(searchQuery), "%' ",
				"OR subtitle ILIKE '%", strings.ToLower(searchQuery), "%' ",
				"OR excerpt ILIKE '%", strings.ToLower(searchQuery), "%' ")
		}
	}

	if len(categoryIDs) > 0 {
		tx.Joins("INNER JOIN de_post_categories ON de_posts.id = de_post_categories.post_id")
		filters = filters + " de_post_categories.category_id IN ("
		for _, id := range categoryIDs {
			filters = fmt.Sprint(filters, id, ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if len(tagIDs) > 0 {
		tx.Joins("INNER JOIN de_post_tags ON de_posts.id = de_post_tags.post_id")
		filters = filters + " de_post_tags.tag_id IN ("
		for _, id := range tagIDs {
			filters = fmt.Sprint(filters, id, ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if len(authorIDs) > 0 {
		tx.Joins("INNER JOIN de_post_authors ON de_posts.id = de_post_authors.post_id")
		filters = filters + " de_post_authors.author_id IN ("
		for _, id := range authorIDs {
			filters = fmt.Sprint(filters, id, ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if len(status) > 0 {
		filters = filters + " de_posts.status IN ("
		for _, sts := range status {
			filters = fmt.Sprint(filters, "'", sts, "'", ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}
	tx.Group("de_posts.id")

	return filters
}
