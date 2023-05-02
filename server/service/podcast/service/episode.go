package service

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/arrays"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

type EpisodeData struct {
	model.Episode
	Authors []coreModel.Author `json:"authors"`
}

// episode model
type Episode struct {
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	Title         string         `json:"title"  validate:"required,max=500"`
	Slug          string         `json:"slug"`
	Season        int            `json:"season"  validate:"required"`
	Episode       int            `json:"episode"  validate:"required"`
	AudioURL      string         `json:"audio_url" validate:"required"`
	PodcastID     uint           `json:"podcast_id"`
	Description   postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	PublishedDate *time.Time     `json:"published_date" sql:"DEFAULT:NULL"`
	MediumID      uint           `json:"medium_id"`
	SpaceID       uint           `json:"space_id"`
	AuthorIDs     []uint         `json:"author_ids"`
	MetaFields    postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
}

var episodeUser config.ContextKey = "episode_user"

type episodePaging struct {
	Total int64         `json:"total"`
	Nodes []EpisodeData `json:"nodes"`
}

type IEpisodeService interface {
	GetById(ctx context.Context, sID, id int) (model.Episode, []errorx.Message)
	List(ctx context.Context, sID uint, offset, limit int, searchQuery, sort string, queryMap url.Values) (episodePaging, []errorx.Message)
	Create(ctx context.Context, sID, uID int, episode *Episode) (EpisodeData, []errorx.Message)
	Update(ctx context.Context, sID, uID, id int, episode *Episode) (EpisodeData, []errorx.Message)
	Delete(sID, id int) []errorx.Message
}

type episodeService struct {
	model *gorm.DB
}

// Create implements IEpisodeService
func (es *episodeService) Create(ctx context.Context, sID int, uID int, episode *Episode) (EpisodeData, []errorx.Message) {

	validationError := validationx.Check(episode)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return EpisodeData{}, validationError
	}

	var episodeSlug string
	if episode.Slug != "" && slugx.Check(episode.Slug) {
		episodeSlug = episode.Slug
	} else {
		episodeSlug = slugx.Make(episode.Title)
	}

	// Get table name
	stmt := &gorm.Statement{DB: es.model}
	_ = stmt.Parse(&EpisodeData{})
	tableName := stmt.Schema.Table

	mediumID := &episode.MediumID
	if episode.MediumID == 0 {
		mediumID = nil
	}
	podcastID := &episode.PodcastID
	if episode.PodcastID == 0 {
		podcastID = nil
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	var err error
	if len(episode.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(episode.Description)
		if err != nil {
			loggerx.Error(err)
			return EpisodeData{}, errorx.Parser(errorx.DecodeError())
		}

		jsonDescription, err = util.GetJSONDescription(episode.Description)
		if err != nil {
			loggerx.Error(err)
			return EpisodeData{}, errorx.Parser(errorx.DecodeError())
		}
	}

	result := &EpisodeData{}
	result.Episode = model.Episode{
		Base: config.Base{
			CreatedAt: episode.CreatedAt,
			UpdatedAt: episode.UpdatedAt,
		},
		Title:           episode.Title,
		Description:     jsonDescription,
		DescriptionHTML: descriptionHTML,
		Slug:            slugx.Approve(&es.model, episodeSlug, sID, tableName),
		Season:          episode.Season,
		Episode:         episode.Episode,
		AudioURL:        episode.AudioURL,
		PodcastID:       podcastID,
		PublishedDate:   episode.PublishedDate,
		MediumID:        mediumID,
		MetaFields:      episode.MetaFields,
		SpaceID:         uint(sID),
	}
	tx := es.model.WithContext(context.WithValue(ctx, episodeUser, uID)).Begin()
	err = tx.Model(&model.Episode{}).Create(&result.Episode).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return EpisodeData{}, errorx.Parser(errorx.DBError())
	}

	if len(episode.AuthorIDs) > 0 {
		authorMap, err := author.All(ctx)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			return EpisodeData{}, errorx.Parser(errorx.DBError())
		}

		episodeAuthors := make([]model.EpisodeAuthor, 0)
		for _, each := range episode.AuthorIDs {
			if _, found := authorMap[fmt.Sprint(each)]; found {
				ea := model.EpisodeAuthor{
					EpisodeID: result.ID,
					AuthorID:  each,
				}
				episodeAuthors = append(episodeAuthors, ea)
				result.Authors = append(result.Authors, authorMap[fmt.Sprint(each)])
			}
		}

		if err = tx.Model(&model.EpisodeAuthor{}).Create(&episodeAuthors).Error; err != nil {
			tx.Rollback()
			loggerx.Error(err)
			return EpisodeData{}, errorx.Parser(errorx.DBError())
		}
	}

	tx.Model(&EpisodeData{}).Preload("Podcast").Preload("Medium").First(&result.Episode)
	tx.Commit()

	return *result, nil
}

// Delete implements IEpisodeService
func (es *episodeService) Delete(sID int, id int) []errorx.Message {
	result := model.EpisodeAuthor{}
	result.ID = uint(id)

	tx := es.model.Begin()
	tx.Delete(&result)

	tx.Model(&model.EpisodeAuthor{}).Where(&model.EpisodeAuthor{
		EpisodeID: uint(id),
	}).Delete(&model.EpisodeAuthor{})

	if config.SearchEnabled() {
		_ = meilisearchx.DeleteDocument("dega", result.ID, "episode")
	}

	tx.Commit()

	return nil
}

// GetById implements IEpisodeService
func (es *episodeService) GetById(ctx context.Context, sID int, id int) (model.Episode, []errorx.Message) {

	result := EpisodeData{}

	result.Episode.ID = uint(id)

	var err error
	err = es.model.Model(&model.Episode{}).Preload("Podcast").Preload("Medium").Preload("Podcast.Medium").Preload("Podcast.PrimaryCategory").Preload("Podcast.Categories").Where(&model.Episode{
		SpaceID: uint(sID),
	}).First(&result.Episode).Error

	if err != nil {
		loggerx.Error(err)
		return model.Episode{}, errorx.Parser(errorx.RecordNotFound())
	}

	// Adding authors in response
	authorMap, err := author.All(ctx)
	if err != nil {
		loggerx.Error(err)
		return model.Episode{}, errorx.Parser(errorx.DBError())
	}
	// 123
	authorEpisodes := make([]model.EpisodeAuthor, 0)
	es.model.Model(&model.EpisodeAuthor{}).Where(&model.EpisodeAuthor{
		EpisodeID: uint(id),
	}).Find(&authorEpisodes)

	for _, each := range authorEpisodes {
		result.Authors = append(result.Authors, authorMap[fmt.Sprint(each.AuthorID)])
	}

	return result.Episode, nil
}

// List implements IEpisodeService
func (es *episodeService) List(ctx context.Context, sID uint, offset int, limit int, searchQuery string, sort string, queryMap url.Values) (episodePaging, []errorx.Message) {

	tx := es.model.Model(&model.Episode{}).Preload("Podcast").Preload("Medium").Preload("Podcast.Medium").Preload("Podcast.PrimaryCategory").Preload("Podcast.Categories").Where(&model.Episode{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	episodes := make([]model.Episode, 0)
	filters := generateEpisodeFilters(queryMap["podcast"])

	result := episodePaging{}
	result.Nodes = make([]EpisodeData, 0)
	var err error
	if filters != "" || searchQuery != "" {

		if config.SearchEnabled() {
			if filters != "" {
				filters = fmt.Sprint(filters, " AND space_id=", sID)
			}
			var hits []interface{}
			hits, err = meilisearchx.SearchWithQuery("dega", searchQuery, filters, "episode")
			if err != nil {
				loggerx.Error(err)
				return episodePaging{}, errorx.Parser(errorx.NetworkError())
			}

			filteredEpisodeIDs := meilisearchx.GetIDArray(hits)
			if len(filteredEpisodeIDs) == 0 {
				return result, nil
			} else {
				err = tx.Where(filteredEpisodeIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&episodes).Error
				if err != nil {
					loggerx.Error(err)
					return episodePaging{}, errorx.Parser(errorx.DBError())
				}
			}
		} else {
			filters = generateEpisodeSQLFilters(searchQuery, queryMap["podcast"])
			err = tx.Where(filters).Count(&result.Total).Offset(offset).Limit(limit).Find(&episodes).Error
			if err != nil {
				loggerx.Error(err)
				return episodePaging{}, errorx.Parser(errorx.DBError())
			}
		}
	} else {
		err = tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&episodes).Error
		if err != nil {
			loggerx.Error(err)
			return episodePaging{}, errorx.Parser(errorx.DBError())
		}
	}

	if len(episodes) == 0 {
		return result, nil
	}

	episodeIDs := make([]uint, 0)
	for _, each := range episodes {
		episodeIDs = append(episodeIDs, each.ID)
	}

	// Adding authors in response
	authorMap, err := author.All(ctx)
	if err != nil {
		loggerx.Error(err)
		return episodePaging{}, errorx.Parser(errorx.DBError())
	}

	authorEpisodes := make([]model.EpisodeAuthor, 0)
	es.model.Model(&model.EpisodeAuthor{}).Where("episode_id IN (?)", episodeIDs).Find(&authorEpisodes)

	episodeAuthorMap := make(map[uint][]coreModel.Author)
	for _, authEpi := range authorEpisodes {
		if _, found := episodeAuthorMap[authEpi.EpisodeID]; !found {
			episodeAuthorMap[authEpi.EpisodeID] = make([]coreModel.Author, 0)
		}
		episodeAuthorMap[authEpi.EpisodeID] = append(episodeAuthorMap[authEpi.EpisodeID], authorMap[fmt.Sprint(authEpi.AuthorID)])
	}

	for _, each := range episodes {
		data := EpisodeData{}
		data.Episode = each
		data.Authors = episodeAuthorMap[each.ID]
		result.Nodes = append(result.Nodes, data)
	}

	return result, nil
}

// Update implements IEpisodeService
func (es *episodeService) Update(ctx context.Context, sID int, uID int, id int, episode *Episode) (EpisodeData, []errorx.Message) {

	validationError := validationx.Check(episode)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return EpisodeData{}, validationError
	}
	var result EpisodeData
	result.Episode.ID = uint(id)
	var err error
	// check record exists or not
	err = es.model.Where(&model.Episode{
		Base: config.Base{
			ID: uint(id),
		},
		SpaceID: uint(sID),
	}).First(&result.Episode).Error

	if err != nil {
		loggerx.Error(err)
		return EpisodeData{}, errorx.Parser(errorx.RecordNotFound())
	}

	var episodeSlug string

	// Get table title
	stmt := &gorm.Statement{DB: es.model}
	_ = stmt.Parse(&model.Episode{})
	tableName := stmt.Schema.Table

	if result.Slug == episode.Slug {
		episodeSlug = result.Slug
	} else if episode.Slug != "" && slugx.Check(episode.Slug) {
		episodeSlug = slugx.Approve(&es.model, episode.Slug, sID, tableName)
	} else {
		episodeSlug = slugx.Approve(&es.model, slugx.Make(episode.Title), sID, tableName)
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(episode.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(episode.Description)
		if err != nil {
			loggerx.Error(err)
			return EpisodeData{}, errorx.Parser(errorx.DecodeError())
		}

		jsonDescription, err = util.GetJSONDescription(episode.Description)
		if err != nil {
			loggerx.Error(err)
			return EpisodeData{}, errorx.Parser(errorx.DecodeError())
		}
	}

	tx := es.model.Begin()

	updateMap := map[string]interface{}{
		"created_at":       episode.CreatedAt,
		"updated_at":       episode.UpdatedAt,
		"updated_by_id":    uint(uID),
		"title":            episode.Title,
		"slug":             episodeSlug,
		"description_html": descriptionHTML,
		"description":      jsonDescription,
		"season":           episode.Season,
		"episode":          episode.Episode,
		"audio_url":        episode.AudioURL,
		"podcast_id":       episode.PodcastID,
		"published_date":   episode.PublishedDate,
		"medium_id":        episode.MediumID,
		"meta_fields":      episode.MetaFields,
	}

	if episode.MediumID == 0 {
		updateMap["medium_id"] = nil
	}

	if episode.PodcastID == 0 {
		updateMap["podcast_id"] = nil
	}

	tx.Model(&result.Episode).Updates(&updateMap).Preload("Medium").Preload("Podcast").Preload("Podcast.Medium").First(&result.Episode)

	// fetch old authors
	prevEpisodeAuthors := make([]model.EpisodeAuthor, 0)
	tx.Model(&model.EpisodeAuthor{}).Where(&model.EpisodeAuthor{
		EpisodeID: uint(result.Episode.ID),
	}).Find(&prevEpisodeAuthors)

	prevAuthorIDs := make([]uint, 0)
	for _, each := range prevEpisodeAuthors {
		prevAuthorIDs = append(prevAuthorIDs, each.AuthorID)
	}

	toCreateIDs, toDeleteIDs := arrays.Difference(prevAuthorIDs, episode.AuthorIDs)

	if len(toDeleteIDs) > 0 {
		tx.Model(&model.EpisodeAuthor{}).Where("author_id IN (?)", toDeleteIDs).Delete(&model.EpisodeAuthor{})
	}

	if len(toCreateIDs) > 0 {
		createEpisodeAuthors := make([]model.EpisodeAuthor, 0)
		for _, each := range toCreateIDs {
			epiAuth := model.EpisodeAuthor{
				EpisodeID: uint(result.Episode.ID),
				AuthorID:  each,
			}
			createEpisodeAuthors = append(createEpisodeAuthors, epiAuth)
		}

		if err = tx.Model(&model.EpisodeAuthor{}).Create(&createEpisodeAuthors).Error; err != nil {
			tx.Rollback()
			loggerx.Error(err)
			return EpisodeData{}, errorx.Parser(errorx.DBError())
		}
	}

	// Fetch current authors
	authorMap, err := author.All(ctx)
	if err != nil {
		loggerx.Error(err)
		return EpisodeData{}, errorx.Parser(errorx.DBError())
	}

	authorEpisodes := make([]model.EpisodeAuthor, 0)
	tx.Model(&model.EpisodeAuthor{}).Where(&model.EpisodeAuthor{
		EpisodeID: uint(id),
	}).Find(&authorEpisodes)

	for _, each := range authorEpisodes {
		result.Authors = append(result.Authors, authorMap[fmt.Sprint(each.AuthorID)])
	}

	tx.Commit()

	return result, nil
}

func GetEpisodeService() IEpisodeService {
	return &episodeService{model: config.DB}
}
func generateEpisodeFilters(podcast []string) string {
	filters := ""
	if len(podcast) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(podcast, "podcast_id"), " AND ")
	}

	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}

func generateEpisodeSQLFilters(searchQuery string, podcasts []string) string {
	filters := ""
	if config.Sqlite() {
		if searchQuery != "" {
			filters = fmt.Sprint(filters, "title LIKE '%", strings.ToLower(searchQuery), "%' AND ")
		}
	} else {
		if searchQuery != "" {
			filters = fmt.Sprint(filters, "title ILIKE '%", strings.ToLower(searchQuery), "%' AND ")
		}
	}

	if len(podcasts) > 0 {
		filters = filters + " podcast_id IN ("
		for _, id := range podcasts {
			filters = fmt.Sprint(filters, id, ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}
