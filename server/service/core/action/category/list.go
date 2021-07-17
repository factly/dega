package category

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int64            `json:"total"`
	Nodes []model.Category `json:"nodes"`
}

// list - Get all categories
// @Summary Show all categories
// @Description Get all categories
// @Tags Category
// @ID get-all-categories
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Param q query string false "Query"
// @Param sort query string false "Sort"
// @Success 200 {object} paging
// @Router /core/categories [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")

	result := paging{}
	result.Nodes = make([]model.Category, 0)

	if sort != "asc" {
		sort = "desc"
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	tx := config.DB.Model(&model.Category{}).Preload("Medium").Where(&model.Category{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	if searchQuery != "" {

		if config.SearchEnabled() {
			filters := fmt.Sprint("space_id=", sID)
			var hits []interface{}

			hits, err = meilisearchx.SearchWithQuery("dega", searchQuery, filters, "category")

			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.NetworkError()))
				return
			}

			filteredCategoryIDs := meilisearchx.GetIDArray(hits)
			if len(filteredCategoryIDs) == 0 {
				renderx.JSON(w, http.StatusOK, result)
				return
			} else {
				err = tx.Where(filteredCategoryIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.DBError()))
					return
				}
			}
		} else {
			err = tx.Where("name ILIKE ?", "%"+strings.ToLower(searchQuery)+"%").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
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
