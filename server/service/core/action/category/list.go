package category

import (
	"net/http"

	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/arrays"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
	"github.com/google/uuid"
)

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

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")
	offset, limit := paginationx.Parse(r.URL.Query())

	categoryService := service.GetCategoryService()
	result, errMessages := categoryService.List(authCtx.SpaceID, offset, limit, searchQuery, sort)
	if errMessages != nil {
		errorx.Render(w, errMessages)
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}

func PublicList(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	searchQuery := r.URL.Query().Get("q")
	sortBy := r.URL.Query().Get("sort_by")
	sortOrder := r.URL.Query().Get("sort_order")
	ids := r.URL.Query()["ids"]
	isFeatured := r.URL.Query().Get("is_featured")
	isFeaturedBool := false
	metafieldsKey := r.URL.Query().Get("meta_fields_key")
	metafieldsValue := r.URL.Query().Get("meta_fields_value")

	if isFeatured == "true" {
		isFeaturedBool = true
	}

	uuids := make([]uuid.UUID, 0)

	if len(ids) > 0 {
		uuids, err = arrays.StrToUUID(ids)
		if err != nil {
			errorx.Render(w, errorx.Parser(errorx.InvalidID()))
			return
		}
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	categoryService := service.GetCategoryService()
	result, errMessages := categoryService.PublicList(authCtx.SpaceID, offset, limit, searchQuery, sortBy, sortOrder, metafieldsKey, metafieldsValue, uuids, isFeaturedBool)
	if errMessages != nil {
		errorx.Render(w, errMessages)
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
