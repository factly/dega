package rating

import (
	"net/http"

	"github.com/factly/dega-server/service/fact-check/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list - Get all ratings
// @Summary Show all ratings
// @Description Get all ratings
// @Tags Rating
// @ID get-all-ratings
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Param all query string false "all"
// @Success 200 {object} paging
// @Router /fact-check/ratings [get]
func List(w http.ResponseWriter, r *http.Request) {
	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	all := r.URL.Query().Get("all")
	offset, limit := paginationx.Parse(r.URL.Query())
	sort := "id desc"

	ratingService := service.GetRatingService()

	result, serviceErr := ratingService.List(authCtx.SpaceID, offset, limit, all, sort)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
