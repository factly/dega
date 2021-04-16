package post

import (
	"fmt"
	"net/http"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/gorilla/feeds"
)

func Feeds(w http.ResponseWriter, r *http.Request) {
	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	now := time.Now()
	feed := &feeds.Feed{
		Title:       "Factly.in",
		Link:        &feeds.Link{Href: "https://factly.in"},
		Description: "Making public data meaningful.",
		Created:     now,
		Image:       &feeds.Image{Title: "Factly", Url: "https://factly.in/wp-content/uploads//2021/01/factly-logo-200-11.png"},
	}

	postList := make([]model.Post, 0)
	config.DB.Model(&model.Post{}).Where(&model.Post{
		Status:  "publish",
		SpaceID: uint(sID),
	}).Order("created_at desc").Limit(10).Find(&postList)

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

	space := model.Space{}
	space.ID = uint(sID)
	config.DB.Model(&model.Space{}).First(&space)

	authorMap := author.Mapper(space.OrganisationID, userID)

	// generate post author map
	postAuthorMap := make(map[uint][]uint)
	for _, po := range postAuthors {
		if _, found := postAuthorMap[po.PostID]; !found {
			postAuthorMap[po.PostID] = make([]uint, 0)
		}
		postAuthorMap[po.PostID] = append(postAuthorMap[po.PostID], po.AuthorID)
	}

	for _, post := range postList {
		author := authorMap[fmt.Sprint(postAuthorMap[post.ID][0])]

		item := feeds.Item{
			Title:       post.Title,
			Link:        &feeds.Link{Href: fmt.Sprint("https://factly.org/", post.Slug)},
			Description: post.Excerpt,
			Content:     post.HTMLDescription,
			Id:          fmt.Sprint(post.ID),
			Created:     post.CreatedAt,
			Updated:     post.UpdatedAt,
		}
		authorName := fmt.Sprint(author.FirstName, " ", author.LastName)
		if authorName != " " {
			item.Author = &feeds.Author{Name: authorName, Email: author.Email}
		}
		feed.Items = append(feed.Items, &item)
	}

	if err := feed.WriteRss(w); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
}
