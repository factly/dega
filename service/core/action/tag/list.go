package tag

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
	Total int64       `json:"total"`
	Nodes []model.Tag `json:"nodes"`
}

// list - Get all tags
// @Summary Show all tags
// @Description Get all tags
// @Tags Tag
// @ID get-all-tags
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Param q query string false "Query"
// @Param sort query string false "Sort"
// @Success 200 {array} model.Tag
// @Router /core/tags [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")

	filteredTagIDs := make([]uint, 0)

	result := paging{}
	result.Nodes = make([]model.Tag, 0)

	if searchQuery != "" {

		filters := fmt.Sprint("space_id=", sID)
		var hits []interface{}

		hits, err = meili.SearchWithQuery(searchQuery, filters, "tag")

		if err != nil {
			loggerx.Error(err)
			renderx.JSON(w, http.StatusOK, result)
			return
		}

		filteredTagIDs = meili.GetIDArray(hits)
		if len(filteredTagIDs) == 0 {
			renderx.JSON(w, http.StatusOK, result)
			return
		}
	}

	if sort != "asc" {
		sort = "desc"
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)

	defer cancel()

	tx := config.DB.Session(&gorm.Session{Context: ctx}).Model(&model.Tag{}).Where(&model.Tag{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	if len(filteredTagIDs) > 0 {
		err = tx.Where(filteredTagIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
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
