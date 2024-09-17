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
	"github.com/google/uuid"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
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
	ParentID         uuid.UUID      `json:"parent_id"`
	MediumID         uuid.UUID      `json:"medium_id"`
	IsFeatured       bool           `json:"is_featured"`
	MetaFields       postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta             postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `json:"header_code"`
	FooterCode       string         `json:"footer_code"`
}

type pagingCategory struct {
	Total int64            `json:"total"`
	Nodes []model.Category `json:"nodes"`
}

type ICategoryService interface {
	GetById(sID, id uuid.UUID) (model.Category, error)
	List(sID uuid.UUID, offset, limit int, searchQuery, sort string) (pagingCategory, []errorx.Message)
	PublicList(sID uuid.UUID, offset, limit int, searchQuery, sortBy, sortOrder, metafieldsKey, metafieldsValue string, ids []uuid.UUID, isFeatured bool) (pagingCategory, []errorx.Message)
	Create(ctx context.Context, sID uuid.UUID, uID string, category *Category) (model.Category, []errorx.Message)
	Update(sID, id uuid.UUID, uID string, c model.Category, category *Category) (model.Category, []errorx.Message)
	Delete(sID, id uuid.UUID) []errorx.Message
}

type CategoryService struct {
	model *gorm.DB
}

func GetCategoryService() ICategoryService {
	return CategoryService{
		model: config.DB.Model(&model.Category{}),
	}
}

func (cs CategoryService) GetById(sID, id uuid.UUID) (model.Category, error) {
	result := &model.Category{}

	result.ID = id

	err := config.DB.Model(&model.Category{}).Preload("Medium").Preload("ParentCategory").Where(&model.Category{
		SpaceID: sID,
	}).First(&result).Error

	return *result, err
}

func (cs CategoryService) List(sID uuid.UUID, offset, limit int, searchQuery, sort string) (pagingCategory, []errorx.Message) {
	result := pagingCategory{}
	result.Nodes = make([]model.Category, 0)

	if sort != "asc" {
		sort = "desc"
	}

	tx := config.DB.Model(&model.Category{}).Preload("Medium").Preload("ParentCategory").Where(&model.Category{
		SpaceID: sID,
	}).Order("created_at " + sort)

	if searchQuery != "" {

		if config.SearchEnabled() {
			filters := fmt.Sprint("space_id=", sID)
			var hits []interface{}

			hits, err := meilisearch.SearchWithQuery("category", searchQuery, filters)

			if err != nil {
				loggerx.Error(err)
				return pagingCategory{}, errorx.Parser(errorx.NetworkError())
			}

			filteredCategoryIDs := meilisearch.GetIDArray(hits)
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

func (cs CategoryService) PublicList(sID uuid.UUID, offset, limit int, searchQuery, sortBy, sortOrder, metafieldsKey, metafieldsValue string, ids []uuid.UUID, isFeatured bool) (pagingCategory, []errorx.Message) {
	result := pagingCategory{}
	result.Nodes = make([]model.Category, 0)

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

	tx := config.DB.Model(&model.Category{})

	if len(ids) > 0 {
		tx = tx.Model(&model.Category{}).Where(ids)
	}

	if searchQuery != "" {
		tx = tx.Model(&model.Category{}).Where("name ILIKE ?", "%"+searchQuery+"%")
	}

	if metafieldsKey != "" && metafieldsValue != "" {
		tx.Model(&model.Post{}).Where("meta_fields @> ?", fmt.Sprintf(`{"%s": "%s"}`, metafieldsKey, metafieldsValue))
	}

	tx.Where(&model.Category{
		SpaceID: sID,
	}).Preload("Medium").Preload("ParentCategory").Count(&result.Total).Order(order).Offset(offset).Limit(limit).Find(&result.Nodes)

	return result, nil

}

func (cs CategoryService) Create(ctx context.Context, sID uuid.UUID, uID string, category *Category) (model.Category, []errorx.Message) {
	validationError := validationx.Check(category)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Category{}, validationError
	}

	var categorySlug string
	if category.Slug != "" && util.CheckSlug(category.Slug) {
		categorySlug = category.Slug
	} else {
		categorySlug = util.MakeSlug(category.Name)
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Category{})
	tableName := stmt.Schema.Table

	// Check if category with same name exist
	if util.CheckName(sID, category.Name, tableName) {
		loggerx.Error(errors.New(`category with same name exist`))
		return model.Category{}, errorx.Parser(errorx.SameNameExist())
	}

	mediumID := &category.MediumID
	if category.MediumID == uuid.Nil {
		mediumID = nil
	}

	parentID := &category.ParentID
	if category.ParentID == uuid.Nil {
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
		Slug:             util.ApproveSlug(categorySlug, sID, tableName),
		ParentID:         parentID,
		MediumID:         mediumID,
		SpaceID:          sID,
		IsFeatured:       category.IsFeatured,
		MetaFields:       category.MetaFields,
		Meta:             category.Meta,
		HeaderCode:       category.HeaderCode,
		FooterCode:       category.FooterCode,
	}
	tx := config.DB.WithContext(context.WithValue(ctx, config.UserContext, uID)).Begin()
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

func (cs CategoryService) Update(sID, id uuid.UUID, uID string, c model.Category, category *Category) (model.Category, []errorx.Message) {
	result := model.Category{}
	result.ID = id

	if result.ID == category.ParentID {
		loggerx.Error(errors.New("cannot add itself as parent"))
		return model.Category{}, errorx.Parser(errorx.CannotSaveChanges())
	}
	var categorySlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Category{})
	tableName := stmt.Schema.Table

	// check if slug is updated or not
	if c.Slug != category.Slug {
		categorySlug = util.ApproveSlug(category.Slug, sID, tableName)
	}

	// Check if category with same name exist
	if category.Name != c.Name && util.CheckName(sID, category.Name, tableName) {
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
	if category.MediumID == uuid.Nil {
		updateMap["medium_id"] = nil
	}

	if category.ParentID == uuid.Nil {
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

func (cs CategoryService) Delete(sID, id uuid.UUID) []errorx.Message {
	result := &model.Category{}

	result.ID = id

	// check if the category is associated with posts
	category := new(model.Category)
	category.ID = id
	totAssociated := config.DB.Model(category).Association("Posts").Count()

	if totAssociated != 0 {
		loggerx.Error(errors.New("category is associated with post"))
		return errorx.Parser(errorx.CannotDelete("category", "post"))
	}

	tx := config.DB.Begin()
	// Updates all children categories
	err := tx.Model(&model.Category{}).Where(&model.Category{
		SpaceID:  sID,
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
	tx.Commit()
	return nil
}
