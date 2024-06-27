package category

import (
	"net/http"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/post"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

func Feeds(w http.ResponseWriter, r *http.Request) {
	// uID, err := util.GetUser(r.Context())
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
	// 	return
	// }

	spaceID := chi.URLParam(r, "space_id")
	sID, err := uuid.Parse(spaceID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// orgID, err := util.GetOrganisationIDfromSpaceID(uint(sID), uint(uID))
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
	// 	return
	// }

	space := model.Space{}

	offset, limit := paginationx.Parse(r.URL.Query())
	sort := r.URL.Query().Get("sort")
	if sort != "asc" {
		sort = "desc"
	}

	slugs := chi.URLParam(r, "slugs")
	categorySlugs := strings.Split(slugs, ",")

	categoryIDs := make([]uuid.UUID, 0)
	categoryList := make([]model.Category, 0)
	config.DB.Model(&model.Category{}).Where("slug IN (?)", categorySlugs).Find(&categoryList)
	for _, each := range categoryList {
		categoryIDs = append(categoryIDs, each.ID)
	}

	feed := post.GetFeed(space)

	postList := make([]model.Post, 0)
	config.DB.Model(&model.Post{}).Joins("JOIN de_post_categories ON de_posts.id = de_post_categories.post_id").Where(&model.Post{
		Status:  "publish",
		SpaceID: sID,
	}).Where("is_page = ?", false).Where("category_id IN (?)", categoryIDs).Order("created_at " + sort).Offset(offset).Limit(limit).Find(&postList)

	feed.Items = post.GetItemsList(postList, space)

	if err := feed.WriteRss(w); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
}
