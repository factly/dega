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
	"github.com/factly/dega-server/util/arrays"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/validationx"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// list response
type paging struct {
	Total int64       `json:"total"`
	Nodes []model.Tag `json:"nodes"`
}

// tag model
type Tag struct {
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	Name             string         `json:"name" validate:"required,max=500"`
	Slug             string         `json:"slug" validate:"required"`
	IsFeatured       bool           `json:"is_featured"`
	BackgroundColour postgres.Jsonb `json:"background_colour"  swaggertype:"primitive,string"`
	Description      postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	MetaFields       postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta             postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `json:"header_code"`
	FooterCode       string         `json:"footer_code"`
	MediumID         uuid.UUID      `json:"medium_id"`
}

type ITagService interface {
	GetById(sID, id uuid.UUID) (model.Tag, error)
	List(sID uuid.UUID, offset, limit int, searchQuery, sort string) (paging, []errorx.Message)
	PublicList(sID uuid.UUID, offset, limit int, searchQuery, sortBy, sortOrder string, ids []uuid.UUID, isFeatured bool) (paging, []errorx.Message)
	Create(ctx context.Context, sID uuid.UUID, uID string, tag *Tag) (model.Tag, []errorx.Message)
	Update(sID, id uuid.UUID, uID string, t model.Tag, tag *Tag) (model.Tag, []errorx.Message)
	Delete(sID, id uuid.UUID) []errorx.Message
}

type TagService struct {
	model *gorm.DB
}

func GetTagService() ITagService {
	return TagService{
		model: config.DB.Model(&model.Tag{}),
	}
}

func (ts TagService) GetById(sID, id uuid.UUID) (model.Tag, error) {
	result := &model.Tag{}

	result.ID = id

	err := ts.model.Where(&model.Tag{
		SpaceID: sID,
	}).First(&result).Error

	return *result, err
}

func (ts TagService) List(sID uuid.UUID, offset, limit int, searchQuery, sort string) (paging, []errorx.Message) {
	result := paging{}
	result.Nodes = make([]model.Tag, 0)

	if sort != "asc" {
		sort = "desc"
	}

	tx := ts.model.Where(&model.Tag{
		SpaceID: sID,
	}).Order("created_at " + sort)

	if searchQuery != "" {

		if config.SearchEnabled() {
			filters := fmt.Sprint("space_id=", sID)
			var hits []interface{}

			hits, err := meilisearch.SearchWithQuery("tag", searchQuery, filters)
			if err != nil {
				loggerx.Error(err)
				return paging{}, errorx.Parser(errorx.NetworkError())
			}

			filteredTagIDs := meilisearch.GetIDArray(hits)
			if len(filteredTagIDs) == 0 {
				return result, nil
			} else {
				err = tx.Where(filteredTagIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return paging{}, errorx.Parser(errorx.DBError())
				}
				return result, nil
			}
		} else {
			if config.Sqlite() {
				err := tx.Where("name LIKE ?", "%"+strings.ToLower(searchQuery)+"%").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return paging{}, errorx.Parser(errorx.DBError())
				}
				return result, nil
			} else {
				err := tx.Where("name ILIKE ?", "%"+strings.ToLower(searchQuery)+"%").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return paging{}, errorx.Parser(errorx.DBError())
				}
				return result, nil
			}
		}
	} else {
		err := tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			return paging{}, errorx.Parser(errorx.DBError())
		}
		return result, nil
	}
}

func (ts TagService) PublicList(sID uuid.UUID, offset, limit int, searchQuery, sortBy, sortOrder string, ids []uuid.UUID, isFeatured bool) (paging, []errorx.Message) {
	result := paging{}
	result.Nodes = make([]model.Tag, 0)

	columns := []string{"created_at", "updated_at", "name", "slug"}
	pageSortBy := "created_at"
	pageSortOrder := "desc"

	if sortOrder != "" && sortOrder == "asc" {
		pageSortOrder = "asc"
	}

	if sortBy != "" && arrays.ColumnValidator(sortBy, columns) {
		pageSortBy = sortBy
	}

	order := pageSortBy + " " + pageSortOrder

	tx := config.DB.Model(&model.Tag{})

	if len(ids) > 0 {
		tx = tx.Model(&model.Tag{}).Where(ids)
	} else {
		tx = tx.Model(&model.Tag{})
	}

	if searchQuery != "" {
		tx = tx.Model(&model.Tag{}).Where("name ILIKE ?", "%"+searchQuery+"%")
	}

	if isFeatured {
		tx = tx.Model(&model.Tag{}).Where("is_featured = ?", true)
	}

	tx.Where(&model.Tag{
		SpaceID: sID,
	}).Preload("Medium").Count(&result.Total).Order(order).Offset(offset).Limit(limit).Find(&result.Nodes)

	return result, nil

}

func (ts TagService) Create(ctx context.Context, sID uuid.UUID, uID string, tag *Tag) (model.Tag, []errorx.Message) {
	validationError := validationx.Check(tag)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Tag{}, validationError
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Tag{})
	tableName := stmt.Schema.Table

	var tagSlug string
	if tag.Slug != "" && util.CheckSlug(tag.Slug) {
		tagSlug = tag.Slug
	} else {
		tagSlug = util.MakeSlug(tag.Name)
	}

	// Check if tag with same name exist
	if util.CheckName(sID, tag.Name, tableName) {
		loggerx.Error(errors.New(`tag with same name exist`))
		return model.Tag{}, errorx.Parser(errorx.SameNameExist())
	}

	var err error
	var descriptionHTML string
	var jsonDescription postgres.Jsonb

	if len(tag.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(tag.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Tag{}, errorx.Parser(errorx.DecodeError())
		}

		jsonDescription, err = util.GetJSONDescription(tag.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Tag{}, errorx.Parser(errorx.DecodeError())
		}
	}

	mediumID := &tag.MediumID
	if tag.MediumID == uuid.Nil {
		mediumID = nil
	}

	result := &model.Tag{
		Base: config.Base{
			CreatedAt: tag.CreatedAt,
			UpdatedAt: tag.UpdatedAt,
		},
		Name:             tag.Name,
		Slug:             util.ApproveSlug(tagSlug, sID, tableName),
		BackgroundColour: tag.BackgroundColour,
		Description:      jsonDescription,
		DescriptionHTML:  descriptionHTML,
		SpaceID:          sID,
		MediumID:         mediumID,
		IsFeatured:       tag.IsFeatured,
		MetaFields:       tag.MetaFields,
		Meta:             tag.Meta,
		HeaderCode:       tag.HeaderCode,
		FooterCode:       tag.FooterCode,
	}

	tx := config.DB.WithContext(context.WithValue(ctx, config.UserContext, uID)).Begin()
	err = tx.Model(&model.Tag{}).Create(&result).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Tag{}, errorx.Parser(errorx.DBError())
	}

	tx.Model(&model.Tag{}).Preload("Medium").First(&result)

	tx.Commit()

	return *result, nil
}

func (ts TagService) Update(sID, id uuid.UUID, uID string, t model.Tag, tag *Tag) (model.Tag, []errorx.Message) {
	validationError := validationx.Check(tag)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Tag{}, validationError
	}

	var tagSlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Tag{})
	tableName := stmt.Schema.Table

	result := &model.Tag{}
	result.ID = id

	tagSlug = tag.Slug

	if t.Slug != tag.Slug {
		tagSlug = util.ApproveSlug(tag.Slug, sID, tableName)
	}

	// Check if tag with same name exist
	if tag.Name != t.Name && util.CheckName(sID, tag.Name, tableName) {
		loggerx.Error(errors.New(`tag with same name exist`))
		return model.Tag{}, errorx.Parser(errorx.SameNameExist())
	}

	// Store HTML description
	var err error
	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(tag.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(tag.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Tag{}, errorx.Parser(errorx.DecodeError())
		}

		jsonDescription, err = util.GetJSONDescription(tag.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Tag{}, errorx.Parser(errorx.DecodeError())
		}
	}

	tx := config.DB.Begin()

	updateMap := map[string]interface{}{
		"created_at":        tag.CreatedAt,
		"updated_at":        tag.UpdatedAt,
		"updated_by_id":     uID,
		"name":              tag.Name,
		"slug":              tagSlug,
		"description":       jsonDescription,
		"description_html":  descriptionHTML,
		"meta_fields":       tag.MetaFields,
		"meta":              tag.Meta,
		"header_code":       tag.HeaderCode,
		"footer_code":       tag.FooterCode,
		"medium_id":         tag.MediumID,
		"is_featured":       tag.IsFeatured,
		"background_colour": tag.BackgroundColour,
	}
	result.MediumID = &tag.MediumID
	if tag.MediumID == uuid.Nil {
		updateMap["medium_id"] = nil
	}

	if tag.CreatedAt.IsZero() {
		updateMap["created_at"] = result.CreatedAt
	}

	if tag.UpdatedAt.IsZero() {
		updateMap["updated_at"] = time.Now()
	}

	tx.Model(&result).Select("IsFeatured").Updates(model.Tag{IsFeatured: tag.IsFeatured})
	err = tx.Model(&result).Updates(&updateMap).Preload("Medium").First(&result).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Tag{}, errorx.Parser(errorx.DBError())
	}

	tx.Commit()
	return *result, nil
}

func (ts TagService) Delete(sID, id uuid.UUID) []errorx.Message {
	// check if tag is associated with posts
	tag := new(model.Tag)
	tag.ID = id
	totAssociated := config.DB.Model(tag).Association("Posts").Count()

	if totAssociated != 0 {
		loggerx.Error(errors.New("tag is associated with post"))
		return errorx.Parser(errorx.CannotDelete("tag", "post"))
	}

	tx := config.DB.Begin()
	tx.Delete(&tag)

	tx.Commit()

	return nil
}
