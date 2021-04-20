package podcast

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	pcast "github.com/eduncan911/podcast"
	"github.com/factly/dega-server/config"
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
	}).Preload("Episodes").Preload("Categories").Preload("Medium").Preload("PrimaryCategory").First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	testDate := time.Now()

	p := pcast.New(
		"Sample Podcasts",
		"http://example.com/",
		"An example Podcast",
		&testDate, &testDate,
	)

	p.Category = result.PrimaryCategory.Name
	p.Description = result.HTMLDescription

	for _, cat := range result.Categories {
		icat := pcast.ICategory{
			Text: cat.Name,
		}
		p.ICategories = append(p.ICategories, &icat)
	}

	p.Language = result.Language

	for _, episode := range result.Episodes {
		item := pcast.Item{
			Title:       episode.Title,
			GUID:        fmt.Sprint(episode.ID),
			Description: "Test desc", //episode.HTMLDescription,
			PubDate:     episode.PublishedDate,
			Link:        fmt.Sprint("https://factly.org/podcasts/", result.ID, "/episodes/", episode.ID),
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
