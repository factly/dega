package category

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/post"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/go-chi/chi"
)

func Feeds(w http.ResponseWriter, r *http.Request) {
	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	spaceID := chi.URLParam(r, "space_id")
	sID, err := strconv.Atoi(spaceID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	orgID, err := util.GetOrganisationIDfromSpaceID(uint(sID), uint(uID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	space, err := util.GetSpacefromKavach(uint(uID), uint(orgID), uint(sID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	offset, limit := paginationx.Parse(r.URL.Query())
	sort := r.URL.Query().Get("sort")
	if sort != "asc" {
		sort = "desc"
	}

	slugs := chi.URLParam(r, "slugs")
	categorySlugs := strings.Split(slugs, ",")

	categoryIDs := make([]uint, 0)
	categoryList := make([]model.Category, 0)
	config.DB.Model(&model.Category{}).Where("slug IN (?)", categorySlugs).Find(&categoryList)
	for _, each := range categoryList {
		categoryIDs = append(categoryIDs, each.ID)
	}

	feed := post.GetFeed(*space)

	postList := make([]model.Post, 0)
	config.DB.Model(&model.Post{}).Joins("JOIN post_categories ON posts.id = post_categories.post_id").Where(&model.Post{
		Status:  "publish",
		SpaceID: uint(sID),
	}).Where("is_page = ?", false).Where("category_id IN (?)", categoryIDs).Order("created_at " + sort).Offset(offset).Limit(limit).Find(&postList)

	feed.Items = post.GetItemsList(postList, *space)

	if err := feed.WriteRss(w); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
}
