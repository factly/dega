package medium

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meili"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
	"gorm.io/gorm"
)

// list response
type paging struct {
	Total int64          `json:"total"`
	Nodes []model.Medium `json:"nodes"`
}

// list - Get all media
// @Summary Show all media
// @Description Get all media
// @Tags Medium
// @ID get-all-media
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param q query string false "Query"
// @Param sort query string false "Sort"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {array} model.Medium
// @Router /core/media [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")
	var filteredMediumIDs []uint

	result := paging{}
	result.Nodes = make([]model.Medium, 0)

	if searchQuery != "" {
		filters := fmt.Sprint("space_id=", sID)

		var hits []interface{}

		hits, err = meili.SearchWithQuery(searchQuery, filters, "medium")
		if err != nil {
			loggerx.Error(err)
			renderx.JSON(w, http.StatusOK, result)
			return
		}

		filteredMediumIDs = meili.GetIDArray(hits)
		if len(filteredMediumIDs) == 0 {
			renderx.JSON(w, http.StatusOK, result)
			return
		}
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	if sort != "asc" {
		sort = "desc"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)

	defer cancel()

	tx := config.DB.Session(&gorm.Session{Context: ctx}).Model(&model.Medium{}).Where(&model.Medium{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	if len(filteredMediumIDs) > 0 {
		err = tx.Where(filteredMediumIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
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
