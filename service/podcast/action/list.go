package podcast

import (
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
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

	filteredPodcastIDs := make([]uint, 0)

	result := paging{}
	result.Nodes = make([]model.Podcast, 0)

	if searchQuery != "" {

		filters := fmt.Sprint("space_id=", sID)
		var hits []interface{}

		hits, err = meilisearchx.SearchWithQuery("dega", searchQuery, filters, "podcast")

		if err != nil {
			loggerx.Error(err)
			renderx.JSON(w, http.StatusOK, result)
			return
		}

		filteredPodcastIDs = meilisearchx.GetIDArray(hits)
		if len(filteredPodcastIDs) == 0 {
			renderx.JSON(w, http.StatusOK, result)
			return
		}
	}

	if sort != "asc" {
		sort = "desc"
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	tx := config.DB.Model(&model.Podcast{}).Preload("Episodes").Preload("Categories").Preload("Medium").Preload("PrimaryCategory").Where(&model.Podcast{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	if len(filteredPodcastIDs) > 0 {
		err = tx.Where(filteredPodcastIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
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
