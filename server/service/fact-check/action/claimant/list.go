package claimant

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	searchService "github.com/factly/dega-server/util/search-service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int64            `json:"total"`
	Nodes []model.Claimant `json:"nodes"`
}

// list - Get all claimants
// @Summary Show all claimants
// @Description Get all claimants
// @Tags Claimant
// @ID get-all-claimants
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Param q query string false "Query"
// @Param sort query string false "Sort"
// @Success 200 {object} paging
// @Router /fact-check/claimants [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")
	all := r.URL.Query().Get("all")

	result := paging{}
	result.Nodes = make([]model.Claimant, 0)

	if sort != "asc" {
		sort = "desc"
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	tx := config.DB.Model(&model.Claimant{}).Preload("Medium").Where(&model.Claimant{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	if all == "true" {
		err = tx.Find(&result.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else if searchQuery != "" {

		if config.SearchEnabled() {
			filters := fmt.Sprint("space_id=", sID)
			var hits []interface{}

			hits, err = searchService.GetSearchService().SearchQuery(searchQuery, filters, "claimant", limit, offset)
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.NetworkError()))
				return
			}

			filteredClaimantIDs := searchService.GetIDArray(hits)
			if len(filteredClaimantIDs) == 0 {
				renderx.JSON(w, http.StatusOK, result)
				return
			} else {
				err = tx.Where(filteredClaimantIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.DBError()))
					return
				}
			}
		} else {
			if config.Sqlite() {
				err = tx.Where("name LIKE ?", "%"+strings.ToLower(searchQuery)+"%").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.DBError()))
					return
				}
			} else {
				err = tx.Where("name ILIKE ?", "%"+strings.ToLower(searchQuery)+"%").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.DBError()))
					return
				}
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
