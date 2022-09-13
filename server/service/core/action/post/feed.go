package post

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/go-chi/chi"
	"github.com/gorilla/feeds"
)

func Feeds(w http.ResponseWriter, r *http.Request) {
	spaceID := chi.URLParam(r, "space_id")
	sID, err := strconv.Atoi(spaceID)
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

	space := model.Space{}
	space.ID = uint(sID)
	if err := config.DB.Preload("Logo").First(&space).Error; err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	feed := GetFeed(space)

	postList := make([]model.Post, 0)
	config.DB.Model(&model.Post{}).Where(&model.Post{
		Status:  "publish",
		SpaceID: uint(sID),
	}).Where("is_page = ?", false).Order("created_at " + sort).Offset(offset).Limit(limit).Find(&postList)

	feed.Items = GetItemsList(postList, space)

	if err := feed.WriteRss(w); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
}

func GetFeed(space model.Space) *feeds.Feed {
	now := time.Now()
	feed := &feeds.Feed{
		Id:          fmt.Sprint(space.ID),
		Title:       space.Name,
		Subtitle:    space.TagLine,
		Link:        &feeds.Link{Href: space.SiteAddress},
		Description: space.Description,
		Created:     now,
	}

	if space.Logo != nil {
		spaceLogo := map[string]interface{}{}
		_ = json.Unmarshal(space.Logo.URL.RawMessage, &spaceLogo)
		if rawURL, found := spaceLogo["raw"]; found {
			feed.Image = &feeds.Image{
				Title: space.Logo.Name,
				Url:   rawURL.(string),
				Link:  rawURL.(string),
			}
		}
	}
	return feed
}

func GetItemsList(postList []model.Post, space model.Space) []*feeds.Item {
	postIDs := make([]uint, 0)
	for _, post := range postList {
		postIDs = append(postIDs, post.ID)
	}

	postAuthors := make([]model.PostAuthor, 0)
	config.DB.Model(&model.PostAuthor{}).Where("post_id IN (?)", postIDs).Find(&postAuthors)

	var userID int
	if len(postAuthors) > 0 {
		userID = int(postAuthors[0].AuthorID)
	}

	authorMap := author.Mapper(space.OrganisationID, userID)

	// generate post author map
	postAuthorMap := make(map[uint][]uint)
	for _, po := range postAuthors {
		if _, found := postAuthorMap[po.PostID]; !found {
			postAuthorMap[po.PostID] = make([]uint, 0)
		}
		postAuthorMap[po.PostID] = append(postAuthorMap[po.PostID], po.AuthorID)
	}

	itemList := make([]*feeds.Item, 0)
	for _, post := range postList {
		author := authorMap[fmt.Sprint(postAuthorMap[post.ID][0])]

		item := feeds.Item{
			Id:          fmt.Sprint(post.ID),
			Title:       post.Title,
			Link:        &feeds.Link{Href: fmt.Sprint("https://factly.org/", post.Slug)},
			Created:     *post.PublishedDate,
			Updated:     post.UpdatedAt,
			Description: post.Excerpt,
			Content:     post.DescriptionHTML,
		}
		authorName := fmt.Sprint(author.FirstName, " ", author.LastName)
		if authorName != " " {
			item.Author = &feeds.Author{Name: authorName, Email: author.Email}
		}
		itemList = append(itemList, &item)
	}
	return itemList
}
