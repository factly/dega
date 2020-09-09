package claim

import (
	"fmt"
	"net/http"

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
	Total int           `json:"total"`
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
	filterRatingID := r.URL.Query().Get("rating")
	filterClaimantID := r.URL.Query().Get("claimant")
	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")

	filters := generateFilters(filterRatingID, filterClaimantID)
	filteredClaimIDs := make([]uint, 0)

	if filters != "" {
		filters = fmt.Sprint(filters, " AND space_id=", sID)

		// Search claims with filter
		var hits []interface{}
		var result map[string]interface{}

		if searchQuery != "" {
			hits, err = meili.SearchWithQuery(searchQuery, filters, "claim")
		} else {
			result, err = meili.SearchWithoutQuery(filters, "claim")
			hits = result["hits"].([]interface{})
		}

		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}

		filteredClaimIDs = meili.GetIDArray(hits)
		if len(filteredClaimIDs) == 0 {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
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
	}).Count(&result.Total).Order("created_at " + sort).Offset(offset).Limit(limit)

	if len(filteredClaimIDs) > 0 {
		tx.Where(filteredClaimIDs).Find(&result.Nodes)
	} else {
		tx.Find(&result.Nodes)
	}

	renderx.JSON(w, http.StatusOK, result)
}

func generateFilters(ratingID, claimantID string) string {
	if ratingID == "" && claimantID == "" {
		return ""
	}

	filters := ""

	if ratingID != "" {
		filters = fmt.Sprint(filters, "rating_id=", ratingID, " AND ")
	}
	if claimantID != "" {
		filters = fmt.Sprint(filters, "claimant_id=", claimantID)
	}
	if filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}
