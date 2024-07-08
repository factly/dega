package service

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/factly/dega-server/config"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/validationx"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// list response
type podcastPaging struct {
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
	MediumID          uuid.UUID      `json:"medium_id"`
	SpaceID           uuid.UUID      `json:"space_id"`
	PrimaryCategoryID uuid.UUID      `json:"primary_category_id"`
	CategoryIDs       []uuid.UUID    `json:"category_ids"`
	HeaderCode        string         `json:"header_code"`
	FooterCode        string         `json:"footer_code"`
	MetaFields        postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
}

type IPodcastService interface {
	GetById(sID, id uuid.UUID) (model.Podcast, []errorx.Message)
	List(sID uuid.UUID, offset, limit int, searchQuery, sort string, queryMap url.Values) (podcastPaging, []errorx.Message)
	Create(ctx context.Context, sID uuid.UUID, uID string, podcast *Podcast) (model.Podcast, []errorx.Message)
	Update(sID, id uuid.UUID, uID string, podcast *Podcast) (model.Podcast, []errorx.Message)
	Delete(sID, id uuid.UUID, result model.Podcast) []errorx.Message
}

type PodcastService struct {
	model *gorm.DB
}

var podcastUser config.ContextKey = "podcast_user"

// Create implements IPodcastService
func (ps *PodcastService) Create(ctx context.Context, sID uuid.UUID, uID string, podcast *Podcast) (model.Podcast, []errorx.Message) {

	validationError := validationx.Check(podcast)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Podcast{}, validationError
	}

	var podcastSlug string
	if podcast.Slug != "" && util.CheckSlug(podcast.Slug) {
		podcastSlug = podcast.Slug
	} else {
		podcastSlug = util.MakeSlug(podcast.Title)
	}

	// Get table name
	stmt := &gorm.Statement{DB: ps.model}
	_ = stmt.Parse(&model.Podcast{})
	tableName := stmt.Schema.Table

	// Check if podcast with same name exist
	if util.CheckName(sID, podcast.Title, tableName) {
		loggerx.Error(errors.New(`podcast with same name exist`))
		return model.Podcast{}, errorx.Parser(errorx.SameNameExist())
	}

	mediumID := &podcast.MediumID
	if podcast.MediumID == uuid.Nil {
		mediumID = nil
	}

	primaryCategoryID := &podcast.PrimaryCategoryID
	if podcast.PrimaryCategoryID == uuid.Nil {
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
		Slug:              util.ApproveSlug(podcastSlug, sID, tableName),
		Language:          podcast.Language,
		MediumID:          mediumID,
		PrimaryCategoryID: primaryCategoryID,
		HeaderCode:        podcast.HeaderCode,
		FooterCode:        podcast.FooterCode,
		MetaFields:        podcast.MetaFields,
		SpaceID:           sID,
	}

	if len(podcast.CategoryIDs) > 0 {
		ps.model.Model(&coreModel.Category{}).Where(podcast.CategoryIDs).Find(&result.Categories)
	}

	tx := ps.model.WithContext(context.WithValue(ctx, podcastUser, uID)).Begin()
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
func (ps *PodcastService) Delete(sID, id uuid.UUID, result model.Podcast) []errorx.Message {

	tx := ps.model.Begin()

	// delete all associations
	if len(result.Categories) > 0 {
		_ = tx.Model(&result).Association("Categories").Delete(result.Categories)
	}

	tx.Model(&model.Podcast{}).Delete(&result)
	tx.Commit()

	return nil
}

// GetById implements IPodcastService
func (ps *PodcastService) GetById(sID, id uuid.UUID) (model.Podcast, []errorx.Message) {

	result := &model.Podcast{}

	result.ID = id

	var err error
	err = ps.model.Model(&model.Podcast{}).Where(&model.Podcast{
		SpaceID: sID,
	}).Preload("Categories").Preload("Medium").Preload("PrimaryCategory").First(&result).Error

	if err != nil {
		loggerx.Error(err)
		return model.Podcast{}, errorx.Parser(errorx.RecordNotFound())
	}
	return *result, nil
}

// List implements IPodcastService
func (ps *PodcastService) List(sID uuid.UUID, offset, limit int, searchQuery, sort string, queryMap url.Values) (podcastPaging, []errorx.Message) {

	var result podcastPaging
	var err error
	tx := ps.model.Model(&model.Podcast{}).Preload("Categories").Preload("Medium").Preload("PrimaryCategory").Where(&model.Podcast{
		SpaceID: sID,
	}).Order("created_at " + sort)

	filters := generatePodcastFilters(queryMap["category"], queryMap["primary_category"], queryMap["language"])
	if filters != "" || searchQuery != "" {

		if config.SearchEnabled() {
			if filters != "" {
				filters = fmt.Sprint(filters, " AND space_id=", sID)
			}
			var hits []interface{}
			hits, err = meilisearch.SearchWithQuery("podcast", searchQuery, filters)
			if err != nil {
				loggerx.Error(err)
				return podcastPaging{}, errorx.Parser(errorx.NetworkError())
			}

			filteredPodcastIDs := meilisearch.GetIDArray(hits)
			if len(filteredPodcastIDs) == 0 {
				return result, nil
			} else {
				err = tx.Where(filteredPodcastIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return podcastPaging{}, errorx.Parser(errorx.DBError())
				}
			}
		} else {
			// filter by sql filters
			filters = generatePodcastSQLFilters(tx, searchQuery, queryMap["category"], queryMap["primary_category"], queryMap["language"])
			err = tx.Where(filters).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
			if err != nil {
				loggerx.Error(err)
				return podcastPaging{}, errorx.Parser(errorx.DBError())
			}
		}
	} else {
		err = tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			return podcastPaging{}, errorx.Parser(errorx.DBError())
		}
	}

	return result, nil
}

// Update implements IPodcastService
func (ps *PodcastService) Update(sID, id uuid.UUID, uID string, podcast *Podcast) (model.Podcast, []errorx.Message) {
	var err error
	validationError := validationx.Check(podcast)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Podcast{}, validationError
	}

	result := &model.Podcast{}
	result.ID = id

	// check record exists or not
	err = ps.model.Where(&model.Podcast{
		Base: config.Base{
			ID: id,
		},
		SpaceID: sID,
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		return model.Podcast{}, errorx.Parser(errorx.RecordNotFound())
	}

	var podcastSlug string

	// Get table title
	stmt := &gorm.Statement{DB: ps.model}
	_ = stmt.Parse(&model.Podcast{})
	tableName := stmt.Schema.Table

	if result.Slug == podcast.Slug {
		podcastSlug = result.Slug
	} else if podcast.Slug != "" && util.CheckSlug(podcast.Slug) {
		podcastSlug = util.ApproveSlug(podcast.Slug, sID, tableName)
	} else {
		podcastSlug = util.ApproveSlug(util.MakeSlug(podcast.Title), sID, tableName)
	}

	// Check if podcast with same title exist
	if podcast.Title != result.Title && util.CheckName(sID, podcast.Title, tableName) {
		loggerx.Error(errors.New(`podcast with same title exist`))
		return model.Podcast{}, errorx.Parser(errorx.SameNameExist())
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
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

	tx := ps.model.Begin()

	newCategories := make([]coreModel.Category, 0)
	if len(podcast.CategoryIDs) > 0 {
		ps.model.Model(&coreModel.Category{}).Where(podcast.CategoryIDs).Find(&newCategories)
		if err = tx.Model(&result).Association("Categories").Replace(&newCategories); err != nil {
			tx.Rollback()
			loggerx.Error(err)
			return model.Podcast{}, errorx.Parser(errorx.DBError())
		}
	} else {
		_ = ps.model.Model(&result).Association("Categories").Clear()
	}

	updateMap := map[string]interface{}{
		"created_at":          podcast.CreatedAt,
		"updated_at":          podcast.UpdatedAt,
		"updated_by_id":       uID,
		"title":               podcast.Title,
		"slug":                podcastSlug,
		"description_html":    descriptionHTML,
		"description":         jsonDescription,
		"medium_id":           podcast.MediumID,
		"meta_fields":         podcast.MetaFields,
		"language":            podcast.Language,
		"primary_category_id": podcast.PrimaryCategoryID,
		"header_code":         podcast.HeaderCode,
		"footer_code":         podcast.FooterCode,
	}

	if podcast.MediumID == uuid.Nil {
		updateMap["medium_id"] = nil
	} else {
		// check if medium exists and belongs to same space
		var medium coreModel.Medium
		if err = ps.model.Where("id = ? AND space_id = ?", podcast.MediumID, sID).First(&medium).Error; err != nil {
			tx.Rollback()
			loggerx.Error(err)
			return model.Podcast{}, errorx.Parser(errorx.GetMessage("BAD REQUEST", http.StatusBadRequest))
		}
	}

	if podcast.PrimaryCategoryID == uuid.Nil {
		updateMap["primary_category_id"] = nil
	} else {
		// check if category exists and belongs to same space
		var category coreModel.Category
		if err = ps.model.Where("id = ? AND space_id = ?", podcast.PrimaryCategoryID, sID).First(&category).Error; err != nil {
			tx.Rollback()
			loggerx.Error(err)
			return model.Podcast{}, errorx.Parser(errorx.GetMessage("BAD REQUEST", http.StatusBadRequest))
		}
	}

	tx.Model(&result).Omit("Categories").Updates(&updateMap).Preload("Categories").Preload("Medium").First(&result)
	tx.Commit()

	return *result, nil
}

func GetPodcastService() IPodcastService {
	return &PodcastService{model: config.DB}
}

func generatePodcastFilters(categoryIDs, primaryCatID, language []string) string {
	filters := ""
	if len(categoryIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearch.GenerateFieldFilter(categoryIDs, "category_ids"), " AND ")
	}

	if len(primaryCatID) > 0 {
		filters = fmt.Sprint(filters, meilisearch.GenerateFieldFilter(primaryCatID, "primary_category_id"), " AND ")
	}

	if len(language) > 0 {
		filters = fmt.Sprint(filters, meilisearch.GenerateFieldFilter(language, "language"), " AND ")
	}

	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}

func generatePodcastSQLFilters(tx *gorm.DB, searchQuery string, categoryIDs, primaryCatID, language []string) string {
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
	if len(primaryCatID) > 0 {
		filters = filters + " primary_category_id IN ("
		for _, id := range primaryCatID {
			filters = fmt.Sprint(filters, id, ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if len(language) > 0 {
		filters = filters + " language IN ("
		for _, lan := range language {
			filters = fmt.Sprint(filters, "'", lan, "'", ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if len(categoryIDs) > 0 {
		tx.Joins("INNER JOIN de_podcast_categories ON de_podcasts.id = de_podcast_categories.podcast_id")
		filters = filters + " de_podcast_categories.category_id IN ("
		for _, id := range categoryIDs {
			filters = fmt.Sprint(filters, id, ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}
