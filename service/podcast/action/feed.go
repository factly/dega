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
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
)

func Feeds(w http.ResponseWriter, r *http.Request) {
	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	space := &coreModel.Space{}
	space.ID = uint(sID)
	if err = config.DB.First(&space).Error; err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	podcastID := chi.URLParam(r, "podcast_id")
	id, err := strconv.Atoi(podcastID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Podcast{}
	result.ID = uint(id)

	err = config.DB.Model(&model.Podcast{}).Where(&model.Podcast{
		SpaceID: uint(sID),
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
		result.HTMLDescription,
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
	p.Description = result.HTMLDescription

	for _, cat := range result.Categories {
		icat := pcast.ICategory{
			Text: cat.Name,
		}
		p.ICategories = append(p.ICategories, &icat)
	}

	p.Language = result.Language

	// fetch all episodes related to this podcast
	episodeList := make([]model.Episode, 0)

	pID := uint(id)
	config.DB.Model(&model.Episode{}).Where(&model.Episode{
		PodcastID: &pID,
	}).Find(&episodeList)

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
		description := episode.HTMLDescription
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
