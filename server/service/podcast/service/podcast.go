package service

import (
	"context"
	"errors"
	"time"

	"github.com/factly/dega-server/config"
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

// list response
type paging struct {
	Total int64           `json:"total"`
	Nodes []model.Podcast `json:"nodes"`
}

// podcast model
type Podcast struct {
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	Title             string         `json:"title"  validate:"required,max=500"`
	Slug              string         `json:"slug"`
	Language          string         `json:"language"  validate:"required"`
	Description       postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	MediumID          uint           `json:"medium_id"`
	SpaceID           uint           `json:"space_id"`
	PrimaryCategoryID uint           `json:"primary_category_id"`
	CategoryIDs       []uint         `json:"category_ids"`
	HeaderCode        string         `json:"header_code"`
	FooterCode        string         `json:"footer_code"`
	MetaFields        postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
}

type IPodcastService interface {
	GetById(sID, id int) (model.Podcast, []errorx.Message)
	List(sID uint, offset, limit int, searchQuery, sort string) (paging, []errorx.Message)
	Create(ctx context.Context, sID, uID int, podcast *Podcast) (model.Podcast, []errorx.Message)
	Update(sID, uID, id int, podcast *Podcast) (model.Podcast, []errorx.Message)
	Delete(sID, id int) []errorx.Message
}

type PodcastService struct {
	model *gorm.DB
}

var podcastUser config.ContextKey = "podcast_user"

// Create implements IPodcastService
func (*PodcastService) Create(ctx context.Context, sID int, uID int, podcast *Podcast) (model.Podcast, []errorx.Message) {

	validationError := validationx.Check(podcast)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Podcast{}, validationError
	}

	var podcastSlug string
	if podcast.Slug != "" && slugx.Check(podcast.Slug) {
		podcastSlug = podcast.Slug
	} else {
		podcastSlug = slugx.Make(podcast.Title)
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Podcast{})
	tableName := stmt.Schema.Table

	// Check if podcast with same name exist
	if util.CheckName(uint(sID), podcast.Title, tableName) {
		loggerx.Error(errors.New(`podcast with same name exist`))
		return model.Podcast{}, errorx.Parser(errorx.SameNameExist())
	}

	mediumID := &podcast.MediumID
	if podcast.MediumID == 0 {
		mediumID = nil
	}

	primaryCategoryID := &podcast.PrimaryCategoryID
	if podcast.PrimaryCategoryID == 0 {
		primaryCategoryID = nil
	}

	// Store HTML description
	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	var err error
	if len(podcast.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(podcast.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Podcast{}, errorx.Parser(errorx.DecodeError())
		}

		jsonDescription, err = util.GetJSONDescription(podcast.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Podcast{}, errorx.Parser(errorx.DecodeError())
		}
	}

	result := &model.Podcast{
		Base: config.Base{
			CreatedAt: podcast.CreatedAt,
			UpdatedAt: podcast.UpdatedAt,
		},
		Title:             podcast.Title,
		Description:       jsonDescription,
		DescriptionHTML:   descriptionHTML,
		Slug:              slugx.Approve(&config.DB, podcastSlug, sID, tableName),
		Language:          podcast.Language,
		MediumID:          mediumID,
		PrimaryCategoryID: primaryCategoryID,
		HeaderCode:        podcast.HeaderCode,
		FooterCode:        podcast.FooterCode,
		MetaFields:        podcast.MetaFields,
		SpaceID:           uint(sID),
	}

	if len(podcast.CategoryIDs) > 0 {
		config.DB.Model(&coreModel.Category{}).Where(podcast.CategoryIDs).Find(&result.Categories)
	}

	tx := config.DB.WithContext(context.WithValue(ctx, podcastUser, uID)).Begin()
	err = tx.Model(&model.Podcast{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Podcast{}, errorx.Parser(errorx.DBError())
	}

	tx.Model(&model.Podcast{}).Preload("Medium").Preload("Categories").Preload("PrimaryCategory").First(&result)
	tx.Commit()

	return *result, nil
}

// Delete implements IPodcastService
func (*PodcastService) Delete(sID int, id int) []errorx.Message {
	panic("unimplemented")
}

// GetById implements IPodcastService
func (*PodcastService) GetById(sID int, id int) (model.Podcast, []errorx.Message) {

	result := &model.Podcast{}

	result.ID = uint(id)

	var err error
	err = config.DB.Model(&model.Podcast{}).Where(&model.Podcast{
		SpaceID: uint(sID),
	}).Preload("Categories").Preload("Medium").Preload("PrimaryCategory").First(&result).Error

	if err != nil {
		loggerx.Error(err)
		return model.Podcast{}, errorx.Parser(errorx.RecordNotFound())
	}
	return *result, nil
}

// List implements IPodcastService
func (*PodcastService) List(sID uint, offset int, limit int, searchQuery string, sort string) (paging, []errorx.Message) {
	panic("unimplemented")
}

// Update implements IPodcastService
func (*PodcastService) Update(sID int, uID int, id int, podcast *Podcast) (model.Podcast, []errorx.Message) {
	panic("unimplemented")
}

func GetPodcastService() IPodcastService {
	return &PodcastService{model: config.DB}
}
