package author

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/go-chi/chi"
	"github.com/gorilla/feeds"
)

func Feeds(w http.ResponseWriter, r *http.Request) {
	// uID, err := util.GetUser(r.Context())
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
	// 	return
	// }
	spaceID := chi.URLParam(r, "space_id")
	_, err := strconv.Atoi(spaceID)
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

	offset, limit := paginationx.Parse(r.URL.Query())
	sort := r.URL.Query().Get("sort")
	if sort != "asc" {
		sort = "desc"
	}

	// create slug map from author's slugs provided in path param
	slugs := chi.URLParam(r, "slugs")
	authorSlugs := strings.Split(slugs, ",")

	slugMap := make(map[string]bool)
	for _, each := range authorSlugs {
		slugMap[each] = true
	}

	space := model.Space{}

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

	// get post authors from published posts in given space
	postAuthors := make([]model.PostAuthor, 0)
	config.DB.Model(&model.PostAuthor{}).Joins("JOIN de_posts ON de_posts.id = de_post_authors.post_id").Where("status = ? AND space_id = ? AND page = ?", "publish", spaceID, false).Find(&postAuthors)

	// var userID int
	// if len(postAuthors) > 0 {
	// 	userID = int(postAuthors[0].AuthorID)
	// }

	// create list of author ids whose posts are to be included
	authorIDs := make([]uint, 0)
	// authorMap := Mapper(space.OrganisationID, userID)

	// for _, author := range authorMap {
	// 	if _, found := slugMap[author.Slug]; found {
	// 		authorIDs = append(authorIDs, author.ID)
	// 	}
	// }

	postList := make([]model.Post, 0)
	config.DB.Model(&model.Post{}).Joins("JOIN de_post_authors ON de_posts.id = de_post_authors.post_id").Where(&model.Post{
		Status: "publish",
		// SpaceID: sID,
	}).Where("is_page = ?", false).Where("author_id IN (?)", authorIDs).Where("de_post_authors.deleted_at IS NULL").Order("created_at " + sort).Offset(offset).Limit(limit).Find(&postList)

	// generate post author map
	// postAuthorMap := make(map[uint][]uint)
	// for _, po := range postAuthors {
	// 	if _, found := postAuthorMap[po.PostID]; !found {
	// 		postAuthorMap[po.PostID] = make([]uint, 0)
	// 	}
	// 	postAuthorMap[po.PostID] = append(postAuthorMap[po.PostID], po.AuthorID)
	// }

	for _, post := range postList {
		// author := authorMap[fmt.Sprint(postAuthorMap[post.ID][0])]

		item := feeds.Item{
			Id:          fmt.Sprint(post.ID),
			Title:       post.Title,
			Link:        &feeds.Link{Href: fmt.Sprint("https://factly.org/", post.Slug)},
			Created:     *post.PublishedDate,
			Updated:     post.UpdatedAt,
			Description: post.Excerpt,
			Content:     post.DescriptionHTML,
		}
		// authorName := fmt.Sprint(author.FirstName, " ", author.LastName)
		// if authorName != " " {
		// 	item.Author = &feeds.Author{Name: authorName, Email: author.Email}
		// }
		feed.Items = append(feed.Items, &item)
	}

	if err := feed.WriteRss(w); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
}
