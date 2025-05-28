package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/validationx"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// medium model
type Medium struct {
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Name        string         `json:"name" validate:"required"`
	Slug        string         `json:"slug"`
	Type        string         `json:"type" validate:"required"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Caption     string         `json:"caption"`
	AltText     string         `json:"alt_text"`
	FileSize    int64          `json:"file_size" validate:"required"`
	URL         postgres.Jsonb `json:"url" swaggertype:"primitive,string"`
	Dimensions  string         `json:"dimensions" validate:"required"`
	MetaFields  postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	SpaceID     uuid.UUID      `json:"space_id"`
}

type pagingMedium struct {
	Total int64          `json:"total"`
	Nodes []model.Medium `json:"nodes"`
}

type MediumService struct {
	model *gorm.DB
}
type IMediumService interface {
	GetById(sID, id uuid.UUID) (model.Medium, error)
	List(sID uuid.UUID, offset, limit int, searchQuery, sort string) (pagingMedium, []errorx.Message)
	Create(ctx context.Context, sID uuid.UUID, uID string, mediumList []Medium) (pagingMedium, []errorx.Message)
	Update(sID, id uuid.UUID, uID string, medium *Medium) (model.Medium, []errorx.Message)
	Delete(sID, id uuid.UUID) []errorx.Message
}

func GetMediumService() IMediumService {
	return MediumService{
		model: config.DB.Model(&model.Medium{}),
	}
}

func (ms MediumService) GetById(sID, id uuid.UUID) (model.Medium, error) {
	result := &model.Medium{}

	result.ID = id

	err := ms.model.Where(&model.Medium{
		SpaceID: sID,
	}).First(&result).Error

	return *result, err
}

func (ms MediumService) List(sID uuid.UUID, offset, limit int, searchQuery, sort string) (pagingMedium, []errorx.Message) {
	result := pagingMedium{}
	result.Nodes = make([]model.Medium, 0)

	if sort != "asc" {
		sort = "desc"
	}

	tx := config.DB.Model(&model.Medium{}).Where(&model.Medium{
		SpaceID: sID,
	}).Order("created_at " + sort)

	if searchQuery != "" {

		if config.SearchEnabled() {
			filters := fmt.Sprint("space_id=", sID)

			var hits []interface{}

			hits, err := meilisearch.SearchWithQuery("medium", searchQuery, filters)
			if err != nil {
				loggerx.Error(err)
				return pagingMedium{}, errorx.Parser(errorx.NetworkError())
			}

			filteredMediumIDs := meilisearch.GetIDArray(hits)
			if len(filteredMediumIDs) == 0 {
				return result, nil
			} else {
				err = tx.Where(filteredMediumIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return pagingMedium{}, errorx.Parser(errorx.NetworkError())
				}
				return result, nil
			}
		} else {
			if config.Sqlite() {
				err := tx.Where("name LIKE ?", "%"+strings.ToLower(searchQuery)+"%").Or("description LIKE ?", "%"+strings.ToLower(searchQuery)+"%").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return pagingMedium{}, errorx.Parser(errorx.DBError())
				}
				return result, nil
			} else {
				err := tx.Where("name ILIKE ?", "%"+strings.ToLower(searchQuery)+"%").Or("description ILIKE ?", "%"+strings.ToLower(searchQuery)+"%").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					tx.Rollback()
					loggerx.Error(err)
					return pagingMedium{}, errorx.Parser(errorx.DBError())
				}
				return result, nil
			}
		}
	} else {
		err := tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			return pagingMedium{}, errorx.Parser(errorx.DBError())
		}
		return result, nil
	}
}

func (ms MediumService) Create(ctx context.Context, sID uuid.UUID, uID string, mediumList []Medium) (pagingMedium, []errorx.Message) {
	result := pagingMedium{}
	result.Nodes = make([]model.Medium, 0)

	for _, medium := range mediumList {
		validationError := validationx.Check(medium)

		if validationError != nil {
			loggerx.Error(errors.New("validation error"))
			return pagingMedium{}, validationError
		}

		var mediumSlug string
		if medium.Slug != "" && util.CheckSlug(medium.Slug) {
			mediumSlug = medium.Slug
		} else {
			mediumSlug = util.MakeSlug(medium.Name)
		}

		// Get table name
		stmt := &gorm.Statement{DB: config.DB}
		_ = stmt.Parse(&model.Medium{})
		tableName := stmt.Schema.Table

		med := model.Medium{
			Base: config.Base{
				CreatedAt: medium.CreatedAt,
				UpdatedAt: medium.UpdatedAt,
			},
			Name:        medium.Name,
			Slug:        util.ApproveSlug(mediumSlug, sID, tableName),
			Title:       medium.Title,
			Type:        medium.Type,
			Description: medium.Description,
			Caption:     medium.Caption,
			AltText:     medium.AltText,
			FileSize:    medium.FileSize,
			URL:         medium.URL,
			Dimensions:  medium.Dimensions,
			MetaFields:  medium.MetaFields,
			SpaceID:     sID,
		}

		result.Nodes = append(result.Nodes, med)
	}

	tx := config.DB.WithContext(context.WithValue(ctx, config.UserContext, uID)).Begin()
	err := tx.Model(&model.Medium{}).Create(&result.Nodes).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return pagingMedium{}, errorx.Parser(errorx.DBError())
	}
	tx.Commit()
	return result, nil
}
func (m MediumService) Delete(sID, id uuid.UUID) []errorx.Message {
	var errs []errorx.Message

	result := &model.Medium{}
	result.ID = id

	uintID := id

	// check if medium is associated with posts
	var totAssociated int64
	err := config.DB.Model(&model.Post{}).Where(&model.Post{
		FeaturedMediumID: &uintID,
	}).Count(&totAssociated).Error
	if err != nil {
		loggerx.Error(err)
		errs = append(errs, errorx.DBError())
		return errs
	}
	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with post"))
		errs = append(errs, errorx.CannotDelete("medium", "post"))
		return errs
	}

	// check if medium is associated with categories
	config.DB.Model(&model.Category{}).Where(&model.Category{
		MediumID: &uintID,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with category"))
		errs = append(errs, errorx.CannotDelete("medium", "category"))
		return errs
	}

	// check if medium is associated with spaces
	config.DB.Model(&model.Space{}).Where(&model.Space{
		LogoID: &uintID,
	}).Or(&model.Space{
		LogoMobileID: &uintID,
	}).Or(&model.Space{
		FavIconID: &uintID,
	}).Or(&model.Space{
		MobileIconID: &uintID,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with rating"))
		errs = append(errs, errorx.CannotDelete("medium", "rating"))
		return errs
	}

	// check if medium is associated with claimants
	// config.DB.Model(&factCheckModel.Claimant{}).Where(&factCheckModel.Claimant{
	// 	MediumID: &uintID,
	// }).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with claimant"))
		errs = append(errs, errorx.CannotDelete("medium", "claimant"))
		return errs
	}

	tx := config.DB.Begin()
	tx.Delete(&result)

	tx.Commit()

	return nil
}

func (m MediumService) Update(sID, id uuid.UUID, uID string, medium *Medium) (model.Medium, []errorx.Message) {
	validationError := validationx.Check(medium)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Medium{}, validationError
	}

	result := &model.Medium{}
	result.ID = id

	// check record exists or not

	var mediumSlug string
	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Medium{})
	tableName := stmt.Schema.Table

	if result.Slug == medium.Slug {
		mediumSlug = result.Slug
	} else if medium.Slug != "" && util.CheckSlug(medium.Slug) {
		mediumSlug = util.ApproveSlug(medium.Slug, sID, tableName)
	} else {
		mediumSlug = util.ApproveSlug(util.MakeSlug(medium.Name), sID, tableName)
	}

	tx := config.DB.Begin()

	updateMap := map[string]interface{}{
		"created_at":    medium.CreatedAt,
		"updated_at":    medium.UpdatedAt,
		"updated_by_id": uID,
		"name":          medium.Name,
		"slug":          mediumSlug,
		"title":         medium.Title,
		"type":          medium.Type,
		"alt_text":      medium.AltText,
		"caption":       medium.Caption,
		"file_size":     medium.FileSize,
		"url":           medium.URL,
		"dimensions":    medium.Dimensions,
		"description":   medium.Description,
		"meta_fields":   medium.MetaFields,
	}

	err := tx.Model(&result).Updates(&updateMap).First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Medium{}, errorx.Parser(errorx.DBError())
	}

	tx.Commit()

	return *result, nil

}
