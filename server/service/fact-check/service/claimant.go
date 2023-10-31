package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

type claimantPaging struct {
	Total int64            `json:"total"`
	Nodes []model.Claimant `json:"nodes"`
}

// claimant model
type Claimant struct {
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Name        string         `json:"name" validate:"required,max=500"`
	Slug        string         `json:"slug"`
	IsFeatured  bool           `json:"is_featured"`
	Description postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	TagLine     string         `json:"tag_line"`
	MediumID    uint           `json:"medium_id"`
	MetaFields  postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta        postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode  string         `json:"header_code"`
	FooterCode  string         `json:"footer_code"`
}

var claimantContext config.ContextKey = "claimant_user"

type IClaimantService interface {
	GetById(sID, id int) (model.Claimant, error)
	List(sID uint, offset, limit int, all, searchQuery, sort string) (claimantPaging, []errorx.Message)
	Create(ctx context.Context, sID, uID int, claimant *Claimant) (model.Claimant, []errorx.Message)
	Update(sID, uID, id int, claimant *Claimant) (model.Claimant, []errorx.Message)
	Delete(sID, id int) []errorx.Message
}

type claimantService struct {
	model *gorm.DB
}

// Create implements IClaimantService
func (cs claimantService) Create(ctx context.Context, sID int, uID int, claimant *Claimant) (model.Claimant, []errorx.Message) {

	validationErr := validationx.Check(claimant)
	if validationErr != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Claimant{}, validationErr
	}

	stmt := &gorm.Statement{DB: cs.model}
	_ = stmt.Parse(&model.Claimant{})
	tableName := stmt.Schema.Table

	var claimantSlug string
	if claimant.Slug != "" && slugx.Check(claimant.Slug) {
		claimantSlug = claimant.Slug
	} else {
		claimantSlug = slugx.Make(claimant.Name)
	}

	mediumID := &claimant.MediumID
	if claimant.MediumID == 0 {
		mediumID = nil
	}

	// Check if claimant with same name exist
	if util.CheckName(uint(sID), claimant.Name, tableName) {
		loggerx.Error(errors.New(`claimant with same name exist`))
		return model.Claimant{}, errorx.Parser(errorx.SameNameExist())
	}

	var descriptionHTML string
	var err error
	var jsonDescription postgres.Jsonb
	if len(claimant.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(claimant.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Claimant{}, errorx.Parser(errorx.DecodeError())
		}

		jsonDescription, err = util.GetJSONDescription(claimant.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Claimant{}, errorx.Parser(errorx.DecodeError())
		}
	}

	result := &model.Claimant{
		Base: config.Base{
			CreatedAt: claimant.CreatedAt,
			UpdatedAt: claimant.UpdatedAt,
		},
		Name:            claimant.Name,
		Slug:            slugx.Approve(&cs.model, claimantSlug, sID, tableName),
		Description:     jsonDescription,
		DescriptionHTML: descriptionHTML,
		MediumID:        mediumID,
		IsFeatured:      claimant.IsFeatured,
		SpaceID:         uint(sID),
		TagLine:         claimant.TagLine,
		MetaFields:      claimant.MetaFields,
		Meta:            claimant.Meta,
		HeaderCode:      claimant.HeaderCode,
		FooterCode:      claimant.FooterCode,
	}

	tx := cs.model.WithContext(context.WithValue(ctx, claimantContext, uID)).Begin()
	err = tx.Model(&model.Claimant{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Claimant{}, errorx.Parser(errorx.DBError())
	}

	tx.Model(&model.Claimant{}).Preload("Medium").First(&result)
	tx.Commit()

	return *result, nil
}

// Delete implements IClaimantService
func (cs claimantService) Delete(sID int, id int) []errorx.Message {

	result := new(model.Claimant)

	result.ID = uint(id)

	// check if claimant is associated with claims
	var totAssociated int64
	cs.model.Model(&model.Claim{}).Where(&model.Claim{
		ClaimantID: uint(id),
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("claimant is associated with claim"))
		return errorx.Parser(errorx.CannotDelete("claimant", "claim"))
	}

	tx := cs.model.Begin()
	tx.Model(&model.Claimant{}).Delete(&result)
	tx.Commit()

	return nil
}

// GetById implements IClaimantService
func (cs claimantService) GetById(sID int, id int) (model.Claimant, error) {

	result := model.Claimant{}
	result.ID = uint(id)

	err := cs.model.Where(&model.Claimant{SpaceID: uint(sID)}).First(&result).Error

	return result, err
}

// List implements IClaimantService
func (cs claimantService) List(sID uint, offset int, limit int, all, searchQuery string, sort string) (claimantPaging, []errorx.Message) {
	var result claimantPaging
	var err error
	tx := cs.model.Model(&model.Claimant{}).Preload("Medium").Where(&model.Claimant{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	if all == "true" {
		err = tx.Find(&result.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			return result, errorx.Parser(errorx.DBError())
		}
	} else if searchQuery != "" {

		if config.SearchEnabled() {
			filters := fmt.Sprint("space_id=", sID)
			var hits []interface{}

			hits, err = meilisearchx.SearchWithQuery("dega", searchQuery, filters, "claimant")
			if err != nil {
				loggerx.Error(err)
				return result, errorx.Parser(errorx.NetworkError())
			}

			filteredClaimantIDs := meilisearchx.GetIDArray(hits)
			if len(filteredClaimantIDs) == 0 {
				return result, nil
			} else {
				err = tx.Where(filteredClaimantIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return result, errorx.Parser(errorx.DBError())
				}
			}
		} else {
			if config.Sqlite() {
				err = tx.Where("name LIKE ?", "%"+strings.ToLower(searchQuery)+"%").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return result, errorx.Parser(errorx.DBError())
				}
			} else {
				err = tx.Where("name ILIKE ?", "%"+strings.ToLower(searchQuery)+"%").Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return result, errorx.Parser(errorx.DBError())
				}
			}
		}
	} else {
		err = tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			log.Println("*****", err)
			return result, errorx.Parser(errorx.DBError())
		}
	}
	return result, nil
}

// Update implements IClaimantService
func (claimantService) Update(sID int, uID int, id int, claimant *Claimant) (model.Claimant, []errorx.Message) {
	panic("unimplemented")
}

func GetClaimantService() IClaimantService {
	return &claimantService{model: config.DB}
}
