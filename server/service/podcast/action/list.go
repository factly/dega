package podcast

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
	"gorm.io/gorm"
)

// list response
type paging struct {
	Total int64           `json:"total"`
	Nodes []model.Podcast `json:"nodes"`
}

// list - Get all podcasts
// @Summary Show all podcasts
// @Description Get all podcasts
// @Tags Podcast
// @ID get-all-podcasts
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Param q query string false "Query"
// @Param category query string false "Category"
// @Param primary_category query string false "Primary Category"
// @Param language query string false "Language"
// @Param sort query string false "Sort"
// @Success 200 {object} paging
// @Router /podcast [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")

	// Filters
	u, _ := url.Parse(r.URL.String())
	queryMap := u.Query()

	result := paging{}
	result.Nodes = make([]model.Podcast, 0)

	if sort != "asc" {
		sort = "desc"
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	tx := config.DB.Model(&model.Podcast{}).Preload("Categories").Preload("Medium").Preload("PrimaryCategory").Where(&model.Podcast{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	filters := generateFilters(queryMap["category"], queryMap["primary_category"], queryMap["language"])
	if filters != "" || searchQuery != "" {

		if config.SearchEnabled() {
			if filters != "" {
				filters = fmt.Sprint(filters, " AND space_id=", sID)
			}
			var hits []interface{}
			hits, err = meilisearchx.SearchWithQuery("dega", searchQuery, filters, "podcast")
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.NetworkError()))
				return
			}

			filteredPodcastIDs := meilisearchx.GetIDArray(hits)
			if len(filteredPodcastIDs) == 0 {
				renderx.JSON(w, http.StatusOK, result)
				return
			} else {
				err = tx.Where(filteredPodcastIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.DBError()))
					return
				}
			}
		} else {
			// filter by sql filters
			filters = generateSQLFilters(tx, searchQuery, queryMap["category"], queryMap["primary_category"], queryMap["language"])
			err = tx.Where(filters).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		}
	} else {
		err = tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}

func generateFilters(categoryIDs, primaryCatID, language []string) string {
	filters := ""
	if len(categoryIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(categoryIDs, "category_ids"), " AND ")
	}

	if len(primaryCatID) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(primaryCatID, "primary_category_id"), " AND ")
	}

	if len(language) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(language, "language"), " AND ")
	}

	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}

func generateSQLFilters(tx *gorm.DB, searchQuery string, categoryIDs, primaryCatID, language []string) string {
	filters := ""
	if config.Sqlite() {
		if searchQuery != "" {
			filters = fmt.Sprint(filters, "title LIKE '%", strings.ToLower(searchQuery), "%' AND ")
		}
	} else {
		if searchQuery != "" {
			filters = fmt.Sprint(filters, "title ILIKE '%", strings.ToLower(searchQuery), "%' AND ")
		}
	}
	if len(primaryCatID) > 0 {
		filters = filters + " primary_category_id IN ("
		for _, id := range primaryCatID {
			filters = fmt.Sprint(filters, id, ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if len(language) > 0 {
		filters = filters + " language IN ("
		for _, lan := range language {
			filters = fmt.Sprint(filters, "'", lan, "'", ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if len(categoryIDs) > 0 {
		tx.Joins("INNER JOIN podcast_categories ON podcasts.id = podcast_categories.podcast_id")
		filters = filters + " podcast_categories.category_id IN ("
		for _, id := range categoryIDs {
			filters = fmt.Sprint(filters, id, ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}
