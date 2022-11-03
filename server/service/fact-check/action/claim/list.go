package claim

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	search "github.com/factly/dega-server/util/search-service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int64         `json:"total"`
	Nodes []model.Claim `json:"nodes"`
}

// list - Get all claims
// @Summary Show all claims
// @Description Get all claims
// @Tags Claim
// @ID get-all-claims
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param rating query string false "Ratings"
// @Param claimant query string false "Claimants"
// @Param q query string false "Query"
// @Param sort query string false "Sort"
// @Param page query string false "page number"
// @Success 200 {Object} paging
// @Router /fact-check/claims [get]
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

	result := paging{}
	result.Nodes = make([]model.Claim, 0)

	offset, limit := paginationx.Parse(r.URL.Query())

	if sort != "asc" {
		sort = "desc"
	}

	tx := config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Rating.Medium").Preload("Claimant").Preload("Claimant.Medium").Where(&model.Claim{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	filters := generateFilters(queryMap["rating"], queryMap["claimant"])
	if filters != "" || searchQuery != "" {
		if config.SearchEnabled() {
			// search claims with filter
			var hits []interface{}
			if filters != "" {
				filters = fmt.Sprint(filters, " AND space_id=", sID)
			}
			hits, err = search.GetSearchService().SearchQuery(searchQuery, filters, "claim", limit, offset)
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.NetworkError()))
				return
			}

			filteredClaimIDs := search.GetIDArray(hits)
			if len(filteredClaimIDs) == 0 {
				renderx.JSON(w, http.StatusOK, result)
				return
			} else {
				err = tx.Where(filteredClaimIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.DBError()))
					return
				}
			}
		} else {
			// search index is disabled
			filters = generateSQLFilters(searchQuery, queryMap["rating"], queryMap["claimant"])
			err = tx.Where(filters).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		}
	} else {
		// no search parameters
		err = tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}

func generateFilters(ratingIDs, claimantIDs []string) string {
	filters := ""

	if len(ratingIDs) > 0 {
		filters = fmt.Sprint(filters, search.GenerateFieldFilter(ratingIDs, "rating_id"), " AND ")
	}
	if len(claimantIDs) > 0 {
		filters = fmt.Sprint(filters, search.GenerateFieldFilter(claimantIDs, "claimant_id"), " AND ")
	}
	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}

func generateSQLFilters(searchQuery string, ratingsIDs, claimantIDs []string) string {
	filters := ""
	if config.Sqlite() {
		if searchQuery != "" {
			filters = fmt.Sprint(filters, "claim LIKE '%", strings.ToLower(searchQuery), "%'", "OR fact LIKE '%", strings.ToLower(searchQuery), "%'", " AND ")
		}

	} else {
		if searchQuery != "" {
			filters = fmt.Sprint(filters, "claim ILIKE '%", strings.ToLower(searchQuery), "%'", "OR fact ILIKE '%", strings.ToLower(searchQuery), "%'", " AND ")
		}
	}

	if len(ratingsIDs) > 0 {
		filters = filters + " rating_id IN ("
		for _, id := range ratingsIDs {
			filters = fmt.Sprint(filters, id, ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if len(claimantIDs) > 0 {
		filters = filters + " claimant_id IN ("
		for _, id := range claimantIDs {
			filters = fmt.Sprint(filters, id, ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}
