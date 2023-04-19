package podcast

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

	if sort != "asc" {
		sort = "desc"
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	podcastService := service.GetPodcastService()
	result, serviceErr := podcastService.List(uint(sID), offset, limit, searchQuery, sort, queryMap)

	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}
	renderx.JSON(w, http.StatusOK, result)
}
