package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
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

type paging struct {
	Total int64           `json:"total"`
	Nodes []model.Episode `json:"nodes"`
}

type IEpisodeService interface {
	GetById(sID, id int) (model.Episode, error)
	List(sID uint, offset, limit int, searchQuery, sort string) (paging, []errorx.Message)
	Create(ctx context.Context, sID, uID int, episode *Episode) (EpisodeData, []errorx.Message)
	Update(sID, uID, id int, episode *Episode) (model.Episode, []errorx.Message)
	Delete(sID, id int) []errorx.Message
}

type episodeService struct {
	model *gorm.DB
}

// Create implements IEpisodeService
func (*episodeService) Create(ctx context.Context, sID int, uID int, episode *Episode) (EpisodeData, []errorx.Message) {

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
	stmt := &gorm.Statement{DB: config.DB}
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
		Slug:            slugx.Approve(&config.DB, episodeSlug, sID, tableName),
		Season:          episode.Season,
		Episode:         episode.Episode,
		AudioURL:        episode.AudioURL,
		PodcastID:       podcastID,
		PublishedDate:   episode.PublishedDate,
		MediumID:        mediumID,
		MetaFields:      episode.MetaFields,
		SpaceID:         uint(sID),
	}
	tx := config.DB.WithContext(context.WithValue(ctx, episodeUser, uID)).Begin()
	err = tx.Model(&model.Episode{}).Create(&result.Episode).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		log.Println("=========>", err)
		return EpisodeData{}, errorx.Parser(errorx.DBError())
	}

	if len(episode.AuthorIDs) > 0 {
		authorMap, err := author.All(ctx)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			log.Println("=========>", err)
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
			log.Println("=========>", err)
			return EpisodeData{}, errorx.Parser(errorx.DBError())
		}
	}

	tx.Model(&EpisodeData{}).Preload("Podcast").Preload("Medium").First(&result.Episode)
	tx.Commit()

	return *result, nil
}

// Delete implements IEpisodeService
func (*episodeService) Delete(sID int, id int) []errorx.Message {
	panic("unimplemented")
}

// GetById implements IEpisodeService
func (*episodeService) GetById(sID int, id int) (model.Episode, error) {
	panic("unimplemented")
}

// List implements IEpisodeService
func (*episodeService) List(sID uint, offset int, limit int, searchQuery string, sort string) (paging, []errorx.Message) {
	panic("unimplemented")
}

// Update implements IEpisodeService
func (*episodeService) Update(sID int, uID int, id int, episode *Episode) (model.Episode, []errorx.Message) {
	panic("unimplemented")
}

func GetEpisodeService() IEpisodeService {
	return &episodeService{model: config.DB}
}
