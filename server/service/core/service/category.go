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

type Category struct {
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	Name             string         `json:"name" validate:"required,max=500"`
	Slug             string         `json:"slug"`
	BackgroundColour postgres.Jsonb `json:"background_colour" validate:"required" swaggertype:"primitive,string"`
	Description      postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	ParentID         uint           `json:"parent_id"`
	MediumID         uint           `json:"medium_id"`
	IsFeatured       bool           `json:"is_featured"`
	MetaFields       postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta             postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `json:"header_code"`
	FooterCode       string         `json:"footer_code"`
}

var userCategoryContext config.ContextKey = "category_user"

type pagingCategory struct {
	Total int64            `json:"total"`
	Nodes []model.Category `json:"nodes"`
}

type ICategoryService interface {
	GetById(sID, id int) (model.Category, error)
	List(sID uint, offset, limit int, searchQuery, sort string) (pagingCategory, []errorx.Message)
	Create(ctx context.Context, sID, uID int, category *Category) (model.Category, []errorx.Message)
	Update(sID, uID, id int, category *Category) (model.Category, []errorx.Message)
	Delete(sID, id int) []errorx.Message
}

type CategoryService struct {
	model *gorm.DB
}

func GetCategoryService() ICategoryService {
	return CategoryService{
		model: config.DB.Model(&model.Category{}),
	}
}

func (cs CategoryService) GetById(sID, id int) (model.Category, error) {
	result := &model.Category{}

	result.ID = uint(id)

	err := config.DB.Model(&model.Category{}).Preload("Medium").Preload("ParentCategory").Where(&model.Category{
		SpaceID: uint(sID),
	}).First(&result).Error

	return *result, err
}

func (cs CategoryService) List(sID uint, offset, limit int, searchQuery, sort string) (pagingCategory, []errorx.Message) {
	result := pagingCategory{}
	result.Nodes = make([]model.Category, 0)

	if sort != "asc" {
		sort = "desc"
	}

	tx := config.DB.Model(&model.Category{}).Preload("Medium").Preload("ParentCategory").Where(&model.Category{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	if searchQuery != "" {

		if config.SearchEnabled() {
			filters := fmt.Sprint("space_id=", sID)
			var hits []interface{}

			hits, err := meilisearchx.SearchWithQuery(util.IndexCategories.String(), searchQuery, filters)

			if err != nil {
				loggerx.Error(err)
				return pagingCategory{}, errorx.Parser(errorx.NetworkError())
			}

			filteredCategoryIDs := meilisearchx.GetIDArray(hits)
			if len(filteredCategoryIDs) == 0 {
				return result, nil
			} else {
				err = tx.Where(filteredCategoryIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return pagingCategory{}, errorx.Parser(errorx.DBError())
				}
				return result, nil
			}
		} else {
			if config.Sqlite() {
				err := tx.Where("name LIKE ?", "%"+strings.ToLower(searchQuery)+"%").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return pagingCategory{}, errorx.Parser(errorx.DBError())
				}
				return result, nil
			} else {
				err := tx.Where("name ILIKE ?", "%"+strings.ToLower(searchQuery)+"%").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return pagingCategory{}, errorx.Parser(errorx.DBError())
				}
				return result, nil
			}

		}
	} else {
		err := tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			return pagingCategory{}, errorx.Parser(errorx.DBError())
		}
		return result, nil
	}
}

func (cs CategoryService) Create(ctx context.Context, sID, uID int, category *Category) (model.Category, []errorx.Message) {
	validationError := validationx.Check(category)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Category{}, validationError
	}

	var categorySlug string
	if category.Slug != "" && slugx.Check(category.Slug) {
		categorySlug = category.Slug
	} else {
		categorySlug = slugx.Make(category.Name)
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Category{})
	tableName := stmt.Schema.Table

	// Check if category with same name exist
	if util.CheckName(uint(sID), category.Name, tableName) {
		loggerx.Error(errors.New(`category with same name exist`))
		return model.Category{}, errorx.Parser(errorx.SameNameExist())
	}

	mediumID := &category.MediumID
	if category.MediumID == 0 {
		mediumID = nil
	}

	parentID := &category.ParentID
	if category.ParentID == 0 {
		parentID = nil
	}

	// Store HTML description
	var descriptionHTML string
	var jsonDescription postgres.Jsonb

	if len(category.Description.RawMessage) > 0 {
		var err error
		descriptionHTML, err = util.GetDescriptionHTML(category.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Category{}, errorx.Parser(errorx.DecodeError())
		}

		jsonDescription, err = util.GetJSONDescription(category.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Category{}, errorx.Parser(errorx.DecodeError())
		}
	}

	result := &model.Category{
		Base: config.Base{
			CreatedAt: category.CreatedAt,
			UpdatedAt: category.UpdatedAt,
		},
		Name:             category.Name,
		Description:      jsonDescription,
		BackgroundColour: category.BackgroundColour,
		DescriptionHTML:  descriptionHTML,
		Slug:             slugx.Approve(&config.DB, categorySlug, sID, tableName),
		ParentID:         parentID,
		MediumID:         mediumID,
		SpaceID:          uint(sID),
		IsFeatured:       category.IsFeatured,
		MetaFields:       category.MetaFields,
		Meta:             category.Meta,
		HeaderCode:       category.HeaderCode,
		FooterCode:       category.FooterCode,
	}
	tx := config.DB.WithContext(context.WithValue(ctx, userCategoryContext, uID)).Begin()
	err := tx.Model(&model.Category{}).Create(result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Category{}, errorx.Parser(errorx.DBError())
	}

	tx.Model(&model.Category{}).Preload("Medium").Preload("ParentCategory").First(&result)
	tx.Commit()
	return *result, nil
}

func (cs CategoryService) Update(sID, uID, id int, category *Category) (model.Category, []errorx.Message) {
	result := model.Category{}
	result.ID = uint(id)

	if result.ID == category.ParentID {
		loggerx.Error(errors.New("cannot add itself as parent"))
		return model.Category{}, errorx.Parser(errorx.CannotSaveChanges())
	}
	var categorySlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Category{})
	tableName := stmt.Schema.Table

	if result.Slug == category.Slug {
		categorySlug = result.Slug
	} else if category.Slug != "" && slugx.Check(category.Slug) {
		categorySlug = slugx.Approve(&config.DB, category.Slug, sID, tableName)
	} else {
		categorySlug = slugx.Approve(&config.DB, slugx.Make(category.Name), sID, tableName)
	}

	// Check if category with same name exist
	if category.Name != result.Name && util.CheckName(uint(sID), category.Name, tableName) {
		loggerx.Error(errors.New(`category with same name exist`))
		return model.Category{}, errorx.Parser(errorx.SameNameExist())
	}

	// Store HTML description
	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(category.Description.RawMessage) > 0 {
		var err error
		descriptionHTML, err = util.GetDescriptionHTML(category.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Category{}, errorx.Parser(errorx.DecodeError())
		}

		jsonDescription, err = util.GetJSONDescription(category.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Category{}, errorx.Parser(errorx.DecodeError())
		}
	}

	tx := config.DB.Begin()
	updateMap := map[string]interface{}{
		"created_at":        category.CreatedAt,
		"updated_at":        category.UpdatedAt,
		"updated_by_id":     uID,
		"name":              category.Name,
		"slug":              categorySlug,
		"description":       jsonDescription,
		"description_html":  descriptionHTML,
		"medium_id":         category.MediumID,
		"is_featured":       category.IsFeatured,
		"meta_fields":       category.MetaFields,
		"meta":              category.Meta,
		"parent_id":         category.ParentID,
		"header_code":       category.HeaderCode,
		"footer_code":       category.FooterCode,
		"background_colour": category.BackgroundColour,
	}
	if category.MediumID == 0 {
		updateMap["medium_id"] = nil
	}

	if category.ParentID == 0 {
		updateMap["parent_id"] = nil
	}

	if category.CreatedAt.IsZero() {
		updateMap["created_at"] = result.CreatedAt
	}

	if category.UpdatedAt.IsZero() {
		updateMap["updated_at"] = time.Now()
	}

	err := tx.Model(&result).Updates(&updateMap).Preload("Medium").Preload("ParentCategory").First(&result).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Category{}, errorx.Parser(errorx.DBError())
	}

	tx.Commit()

	return result, nil
}

func (cs CategoryService) Delete(sID, id int) []errorx.Message {
	result := &model.Category{}

	result.ID = uint(id)

	// check if the category is associated with posts
	category := new(model.Category)
	category.ID = uint(id)
	totAssociated := config.DB.Model(category).Association("Posts").Count()

	if totAssociated != 0 {
		loggerx.Error(errors.New("category is associated with post"))
		return errorx.Parser(errorx.CannotDelete("category", "post"))
	}

	tx := config.DB.Begin()
	// Updates all children categories
	err := tx.Model(&model.Category{}).Where(&model.Category{
		SpaceID:  uint(sID),
		ParentID: &result.ID,
	}).UpdateColumn("parent_id", nil).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return errorx.Parser(errorx.DBError())
	}

	err = tx.Delete(&result).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return errorx.Parser(errorx.DBError())
	}
	return nil
}
