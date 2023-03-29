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
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
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
	MediumID         uint           `json:"medium_id"`
}

var userContext config.ContextKey = "tag_user"

type ITagService interface {
	GetById(sID, id int) (model.Tag, error)
	List(sID uint, offset, limit int, searchQuery, sort string) (paging, []errorx.Message)
	Create(ctx context.Context, sID, uID int, tag *Tag) (model.Tag, []errorx.Message)
	Update(sID, uID, id int, tag *Tag) (model.Tag, []errorx.Message)
	Delete(sID, id int) []errorx.Message
}

type TagService struct {
	model *gorm.DB
}

func GetTagService() ITagService {
	return TagService{
		model: config.DB.Model(&model.Tag{}),
	}
}

func (ts TagService) GetById(sID, id int) (model.Tag, error) {
	result := &model.Tag{}

	result.ID = uint(id)

	err := ts.model.Where(&model.Tag{
		SpaceID: uint(sID),
	}).First(&result).Error

	return *result, err
}

func (ts TagService) List(sID uint, offset, limit int, searchQuery, sort string) (paging, []errorx.Message) {
	result := paging{}
	result.Nodes = make([]model.Tag, 0)

	if sort != "asc" {
		sort = "desc"
	}

	tx := ts.model.Where(&model.Tag{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	if searchQuery != "" {

		if config.SearchEnabled() {
			filters := fmt.Sprint("space_id=", sID)
			var hits []interface{}

			hits, err := meilisearchx.SearchWithQuery("dega", searchQuery, filters, "tag")
			if err != nil {
				loggerx.Error(err)
				return paging{}, errorx.Parser(errorx.NetworkError())
			}

			filteredTagIDs := meilisearchx.GetIDArray(hits)
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

func (ts TagService) Create(ctx context.Context, sID, uID int, tag *Tag) (model.Tag, []errorx.Message) {
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
	if tag.Slug != "" && slugx.Check(tag.Slug) {
		tagSlug = tag.Slug
	} else {
		tagSlug = slugx.Make(tag.Name)
	}

	// Check if tag with same name exist
	if util.CheckName(uint(sID), tag.Name, tableName) {
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
	if tag.MediumID == 0 {
		mediumID = nil
	}

	result := &model.Tag{
		Base: config.Base{
			CreatedAt: tag.CreatedAt,
			UpdatedAt: tag.UpdatedAt,
		},
		Name:             tag.Name,
		Slug:             slugx.Approve(&config.DB, tagSlug, sID, tableName),
		BackgroundColour: tag.BackgroundColour,
		Description:      jsonDescription,
		DescriptionHTML:  descriptionHTML,
		SpaceID:          uint(sID),
		MediumID:         mediumID,
		IsFeatured:       tag.IsFeatured,
		MetaFields:       tag.MetaFields,
		Meta:             tag.Meta,
		HeaderCode:       tag.HeaderCode,
		FooterCode:       tag.FooterCode,
	}

	tx := config.DB.WithContext(context.WithValue(ctx, userContext, uID)).Begin()
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

func (ts TagService) Update(sID, uID, id int, tag *Tag) (model.Tag, []errorx.Message) {
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
	result.ID = uint(id)

	if tag.Slug != "" && slugx.Check(tag.Slug) {
		tagSlug = slugx.Approve(&config.DB, tag.Slug, sID, tableName)
	} else {
		tagSlug = slugx.Approve(&config.DB, slugx.Make(tag.Name), sID, tableName)
	}

	// Check if tag with same name exist
	if tag.Name != result.Name && util.CheckName(uint(sID), tag.Name, tableName) {
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
		"updated_by_id":     uint(uID),
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
	if tag.MediumID == 0 {
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

func (ts TagService) Delete(sID, id int) []errorx.Message {
	// check if tag is associated with posts
	tag := new(model.Tag)
	tag.ID = uint(id)
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
