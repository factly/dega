package claim

import (
	"net/http"
	"net/url"

	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/service/fact-check/service"
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

	offset, limit := paginationx.Parse(r.URL.Query())

	if sort != "asc" {
		sort = "desc"
	}
	claimService := service.GetClaimService()
	result, serviceErr := claimService.List(uint(sID), offset, limit, searchQuery, sort, queryMap)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}
	renderx.JSON(w, http.StatusOK, result)
}
