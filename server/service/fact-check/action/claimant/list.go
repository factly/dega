package claimant

import (
	"log"
	"net/http"

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

	if sort != "asc" {
		sort = "desc"
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	claimantService := service.GetClaimantService()
	result, serviceErr := claimantService.List(uint(sID), offset, limit, all, searchQuery, sort)
	if serviceErr != nil {
		log.Println("=======>", serviceErr)
		errorx.Render(w, serviceErr)
		return
	}
	renderx.JSON(w, http.StatusOK, result)
}
