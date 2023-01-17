package podcast

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	pcast "github.com/eduncan911/podcast"
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
)

func Feeds(w http.ResponseWriter, r *http.Request) {
	spaceID := chi.URLParam(r, "space_id")
	sID, err := strconv.Atoi(spaceID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	space := &coreModel.Space{}
	space.ID = uint(sID)
	if err = config.DB.First(&space).Error; err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	slug := chi.URLParam(r, "podcast_slug")
	if slug == "" {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// getting page query param
	pageNo := 1
	page := r.URL.Query().Get("page")
	if page != "" {
		pageNo, _ = strconv.Atoi(page)
	}

	// getting limit query param
	limit := 10
	lim := r.URL.Query().Get("limit")
	if lim != "" {
		limit, _ = strconv.Atoi(lim)
	}
	// max limit of 300
	if limit > 300 {
		limit = 300
	}

	sort := r.URL.Query().Get("sort")
	if sort != "asc" {
		sort = "desc"
	}

	result := &model.Podcast{}

	err = config.DB.Model(&model.Podcast{}).Where(&model.Podcast{
		SpaceID: uint(sID),
		Slug:    slug,
	}).Preload("Categories").Preload("Medium").Preload("PrimaryCategory").First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	now := time.Now()

	p := pcast.New(
		result.Title,
		fmt.Sprint("http://factly.org/podcasts/", result.Slug),
		result.DescriptionHTML,
		&now, &now,
	)

	if result.Medium != nil {
		podcastMediumURL := map[string]interface{}{}
		_ = json.Unmarshal(result.Medium.URL.RawMessage, &podcastMediumURL)
		if rawURL, found := podcastMediumURL["raw"]; found {
			p.IImage = &pcast.IImage{
				HREF: rawURL.(string),
			}
		}
	}

	if result.PrimaryCategory != nil {
		p.Category = result.PrimaryCategory.Name
	}
	p.Description = result.DescriptionHTML

	for _, cat := range result.Categories {
		icat := pcast.ICategory{
			Text: cat.Name,
		}
		p.ICategories = append(p.ICategories, &icat)
	}

	p.Language = result.Language

	// fetch all episodes related to this podcast
	episodeList := make([]model.Episode, 0)

	config.DB.Model(&model.Episode{}).Where(&model.Episode{
		PodcastID: &result.ID,
	}).Preload("Medium").Order("created_at " + sort).Limit(limit).Offset((pageNo - 1) * limit).Find(&episodeList)

	episodeIDs := make([]uint, 0)
	for _, each := range episodeList {
		episodeIDs = append(episodeIDs, each.ID)
	}

	episodeAuthors := make([]model.EpisodeAuthor, 0)
	config.DB.Model(&model.EpisodeAuthor{}).Where("episode_id IN (?)", episodeIDs).Find(&episodeAuthors)

	var authorMap map[string]coreModel.Author
	if len(episodeAuthors) > 0 {
		authorMap = author.Mapper(space.OrganisationID, int(episodeAuthors[0].AuthorID))
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	episodeAuthorMap := make(map[uint]uint)
	for _, ea := range episodeAuthors {
		if _, found := episodeAuthorMap[ea.EpisodeID]; !found {
			episodeAuthorMap[ea.EpisodeID] = ea.AuthorID
		}
	}

	for _, episode := range episodeList {
		description := episode.DescriptionHTML
		if description == "" {
			description = "----"
		}
		item := pcast.Item{
			Title:       episode.Title,
			GUID:        fmt.Sprint(episode.ID),
			Description: description,
			Link:        fmt.Sprint("https://factly.org/podcasts/", result.ID, "/episodes/", episode.ID),
			Source:      episode.AudioURL,
		}

		if episode.PublishedDate != nil {
			item.PubDateFormatted = episode.PublishedDate.String()
		}
		if episode.Medium != nil {
			episodeMediumURL := map[string]interface{}{}
			_ = json.Unmarshal(episode.Medium.URL.RawMessage, &episodeMediumURL)
			if rawURL, found := episodeMediumURL["raw"]; found {
				item.IImage = &pcast.IImage{
					HREF: rawURL.(string),
				}
			}
		}

		if authID, found := episodeAuthorMap[episode.ID]; found {
			if author, found := authorMap[fmt.Sprint(authID)]; found {
				item.Author = &pcast.Author{
					Name:  fmt.Sprint(author.FirstName, " ", author.LastName),
					Email: author.Email,
				}
			}
		}

		if _, err := p.AddItem(item); err != nil {
			fmt.Println(item.Title, ": error", err.Error())
			return
		}
	}

	w.Header().Set("Content-Type", "application/xml")

	if err := p.Encode(w); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
