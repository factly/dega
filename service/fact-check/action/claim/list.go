package claim

import (
	"fmt"
	"net/http"
	"net/url"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meili"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
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

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// Filters
	u, _ := url.Parse(r.URL.String())
	queryMap := u.Query()

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")

	filters := generateFilters(queryMap["rating"], queryMap["claimant"])
	filteredClaimIDs := make([]uint, 0)

	if filters != "" {
		filters = fmt.Sprint(filters, " AND space_id=", sID)
	}

	if filters != "" || searchQuery != "" {
		// Search claims with filter
		var hits []interface{}
		var result map[string]interface{}

		if searchQuery != "" {
			hits, err = meili.SearchWithQuery(searchQuery, filters, "claim")
		} else {
			result, err = meili.SearchWithoutQuery(filters, "claim")
			if _, found := result["hits"]; found {
				hits = result["hits"].([]interface{})
			}
		}

		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}

		filteredClaimIDs = meili.GetIDArray(hits)
		if len(filteredClaimIDs) == 0 {
			renderx.JSON(w, http.StatusOK, paging{
				Nodes: make([]model.Claim, 0),
				Total: 0,
			})
			return
		}
	}

	result := paging{}
	result.Nodes = make([]model.Claim, 0)

	offset, limit := paginationx.Parse(r.URL.Query())

	if sort != "asc" {
		sort = "desc"
	}

	tx := config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Rating.Medium").Preload("Claimant").Preload("Claimant.Medium").Where(&model.Claim{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	if len(filteredClaimIDs) > 0 {
		err = tx.Where(filteredClaimIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
	} else {
		err = tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
	}

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}

func generateFilters(ratingIDs, claimantIDs []string) string {
	filters := ""

	if len(ratingIDs) > 0 {
		filters = fmt.Sprint(filters, meili.GenerateFieldFilter(ratingIDs, "rating_id"), " AND ")
	}
	if len(claimantIDs) > 0 {
		filters = fmt.Sprint(filters, meili.GenerateFieldFilter(claimantIDs, "claimant_id"), " AND ")
	}
	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}
