package episode

import (
	"net/http"
	"net/url"

	"github.com/factly/dega-server/service/podcast/service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int64         `json:"total"`
	Nodes []episodeData `json:"nodes"`
}

// list - Get all episodes
// @Summary Show all episodes
// @Description Get all episodes
// @Tags Episode
// @ID get-all-episodes
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Param q query string false "Query"
// @Param podcast query string false "Podcast"
// @Param sort query string false "Sort"
// @Success 200 {object} paging
// @Router /podcast/episodes [get]
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

	if sort != "asc" {
		sort = "desc"
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	episodeService := service.GetEpisodeService()

	result, serviceErr := episodeService.List(r.Context(), uint(sID), offset, limit, searchQuery, sort, queryMap)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
