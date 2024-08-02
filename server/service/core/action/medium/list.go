package medium

import (
	"fmt"
	"net/http"
	"time"

	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

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

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")
	offset, limit := paginationx.Parse(r.URL.Query())
	dateStr := r.URL.Query().Get("date")

	var year int
	var month time.Month
	var yearMonthProvided bool

	if dateStr != "" {
		layout := "2006-01"
		dateInt, err := time.Parse(layout, dateStr)
		if err != nil {
			fmt.Println("Error parsing date:", err)
			return
		}
		year = dateInt.Year()
		month = dateInt.Month()
		yearMonthProvided = true
	}

	mediumService := service.GetMediumService()
	result, errMessages := mediumService.List(authCtx.SpaceID, offset, limit, searchQuery, sort, year, month, yearMonthProvided, dateStr)
	if errMessages != nil {
		errorx.Render(w, errMessages)
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
