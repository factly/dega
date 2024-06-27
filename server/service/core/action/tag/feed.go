package tag

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
	spaceID := chi.URLParam(r, "space_id")
	sID, err := uuid.Parse(spaceID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	offset, limit := paginationx.Parse(r.URL.Query())
	sort := r.URL.Query().Get("sort")
	if sort != "asc" {
		sort = "desc"
	}

	slugs := chi.URLParam(r, "slugs")
	tagSlugs := strings.Split(slugs, ",")

	space := model.Space{}
	space.ID = sID
	if err := config.DB.Model(&model.Space{}).Preload("SpaceSettings.Logo").First(&space).Error; err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tagIDs := make([]uuid.UUID, 0)
	tagList := make([]model.Tag, 0)
	config.DB.Model(&model.Tag{}).Where("slug IN (?)", tagSlugs).Find(&tagList)
	for _, each := range tagList {
		tagIDs = append(tagIDs, each.ID)
	}

	feed := post.GetFeed(space)

	postList := make([]model.Post, 0)
	config.DB.Model(&model.Post{}).Joins("JOIN de_post_tags ON de_posts.id = de_post_tags.post_id").Where(&model.Post{
		Status:  "publish",
		SpaceID: sID,
	}).Where("is_page = ?", false).Where("tag_id IN (?)", tagIDs).Order("created_at " + sort).Offset(offset).Limit(limit).Find(&postList)

	feed.Items = post.GetItemsList(postList, space)

	if err := feed.WriteRss(w); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
}
