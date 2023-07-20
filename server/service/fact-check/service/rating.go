package service

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// rating model
type Rating struct {
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	Name             string         `json:"name" validate:"required,max=500"`
	Slug             string         `json:"slug"`
	BackgroundColour postgres.Jsonb `json:"background_colour" validate:"required" swaggertype:"primitive,string"`
	TextColour       postgres.Jsonb `json:"text_colour" validate:"required" swaggertype:"primitive,string"`
	Description      postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	NumericValue     int            `json:"numeric_value" validate:"required"`
	MediumID         uint           `json:"medium_id"`
	MetaFields       postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta             postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `json:"header_code"`
	FooterCode       string         `json:"footer_code"`
}

// ratingPaging
type ratingPaging struct {
	Total int64          `json:"total"`
	Nodes []model.Rating `json:"nodes"`
}

type IRatingService interface {
	GetById(sID, id int) (model.Rating, error)
	List(sID int64, offset, limit int, all string, sort string) (ratingPaging, []errorx.Message)
	Create(ctx context.Context, sID, uID int, rating *Rating) (model.Rating, []errorx.Message)
	Update(sID, uID, id int, rating *Rating) (model.Rating, []errorx.Message)
	Delete(sID, id int64) []errorx.Message
	Default(ctx context.Context, sID, uID int, ratings []model.Rating) (ratingPaging, []errorx.Message)
}

var ratingContext config.ContextKey = "rating_user"

type RatingService struct {
	model *gorm.DB
}

// Create implements IRatingService
func (rs RatingService) Create(ctx context.Context, sID int, uID int, rating *Rating) (model.Rating, []errorx.Message) {

	validationErr := validationx.Check(rating)

	if validationErr != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Rating{}, validationErr
	}

	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Rating{})
	tableName := stmt.Schema.Table

	var ratingSlug string

	if rating.Slug != "" && slugx.Check(rating.Slug) {
		ratingSlug = rating.Slug
	} else {
		ratingSlug = slugx.Make(rating.Name)
	}
	// check  if  rating name exists
	if util.CheckName(uint(sID), rating.Name, tableName) {
		loggerx.Error(errors.New(`rating with same name exist`))
		return model.Rating{}, errorx.Parser(errorx.SameNameExist())
	}

	// check if rating with same numeric value exists
	var sameValueRatings int64
	rs.model.Model(&model.Rating{}).Where(&model.Rating{
		SpaceID:      uint(sID),
		NumericValue: rating.NumericValue,
	}).Count(&sameValueRatings)

	if sameValueRatings > 0 {
		loggerx.Error(errors.New(`rating with same numeric value exist`))
		return model.Rating{}, errorx.Parser(errorx.GetMessage("rating with same numeric value exists", http.StatusUnprocessableEntity))
	}
	mediumID := &rating.MediumID
	if rating.MediumID == 0 {
		mediumID = nil
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	var err error
	if len(rating.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(rating.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Rating{}, errorx.Parser(errorx.DecodeError())
		}

		jsonDescription, err = util.GetJSONDescription(rating.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Rating{}, errorx.Parser(errorx.DecodeError())
		}
	}

	result := &model.Rating{
		Base: config.Base{
			CreatedAt: rating.CreatedAt,
			UpdatedAt: rating.UpdatedAt,
		},
		Name:             rating.Name,
		Slug:             slugx.Approve(&config.DB, ratingSlug, sID, tableName),
		BackgroundColour: rating.BackgroundColour,
		TextColour:       rating.TextColour,
		Description:      jsonDescription,
		DescriptionHTML:  descriptionHTML,
		MediumID:         mediumID,
		SpaceID:          uint(sID),
		NumericValue:     rating.NumericValue,
		MetaFields:       rating.MetaFields,
		Meta:             rating.Meta,
		HeaderCode:       rating.HeaderCode,
		FooterCode:       rating.FooterCode,
	}

	tx := config.DB.WithContext(context.WithValue(ctx, ratingContext, uID)).Begin()
	err = tx.Model(&model.Rating{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Rating{}, errorx.Parser(errorx.DBError())
	}

	tx.Model(&model.Rating{}).Preload("Medium").First(&result)

	tx.Commit()
	return *result, nil
}

// Delete implements IRatingService
func (rs RatingService) Delete(sID int64, id int64) []errorx.Message {
	//check if rating is associated with any post
	rating := new(model.Rating)
	rating.ID = uint(id)

	totAssociated := rs.model.Model(rating).Association("Claims").Count()
	if totAssociated != 0 {
		loggerx.Error(errors.New(`rating is associated with post`))
		return errorx.Parser(errorx.CannotDelete("rating", "claim"))
	}

	tx := rs.model.Begin()
	tx.Delete(rating)
	tx.Commit()

	return nil
}

// GetById implements IRatingService
func (rs RatingService) GetById(sID int, id int) (model.Rating, error) {
	result := &model.Rating{}

	result.ID = uint(id)

	err := rs.model.Where(&model.Rating{SpaceID: uint(sID)}).First(&result).Error

	return *result, err
}

// List implements IRatingService
func (rs RatingService) List(sID int64, offset int, limit int, all string, sort string) (ratingPaging, []errorx.Message) {

	result := ratingPaging{}
	result.Nodes = make([]model.Rating, 0)

	stmt := rs.model.Model(&model.Rating{}).Preload("Medium").Where(&model.Rating{
		SpaceID: uint(sID),
	}).Count(&result.Total).Order(sort)

	var err error

	if all == "true" {
		err = stmt.Find(&result.Nodes).Error
	} else {
		err = stmt.Offset(offset).Limit(limit).Find(&result.Nodes).Error
	}

	if err != nil {
		loggerx.Error(err)
		return result, errorx.Parser(errorx.DBError())
	}

	return result, nil
}

// Update implements IRatingService
func (rs RatingService) Update(sID int, uID int, id int, rating *Rating) (model.Rating, []errorx.Message) {
	result := &model.Rating{}
	result.ID = uint(id)

	validationErr := validationx.Check(rating)
	if validationErr != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Rating{}, validationErr
	}

	err := rs.model.Where(&model.Rating{
		SpaceID: uint(sID),
		Base: config.Base{
			ID: uint(id),
		},
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		return model.Rating{}, errorx.Parser(errorx.RecordNotFound())
	}

	var ratingSlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Rating{})
	tableName := stmt.Schema.Table

	if result.Slug == rating.Slug {
		ratingSlug = result.Slug
	} else if rating.Slug != "" && slugx.Check(rating.Slug) {
		ratingSlug = slugx.Approve(&config.DB, rating.Slug, sID, tableName)
	} else {
		ratingSlug = slugx.Approve(&config.DB, slugx.Make(rating.Name), sID, tableName)
	}

	// Check if rating with same name exist
	if rating.Name != result.Name && util.CheckName(uint(sID), rating.Name, tableName) {
		loggerx.Error(errors.New(`rating with same name exist`))
		return model.Rating{}, errorx.Parser(errorx.GetMessage(`rating with same name exist`, http.StatusUnprocessableEntity))
	}

	if rating.NumericValue != result.NumericValue {
		// Check if rating with same numeric value exist
		var sameValueRatings int64
		config.DB.Model(&model.Rating{}).Where(&model.Rating{
			SpaceID:      uint(sID),
			NumericValue: rating.NumericValue,
		}).Count(&sameValueRatings)

		if sameValueRatings > 0 {
			loggerx.Error(errors.New(`rating with same numeric value exist`))
			return model.Rating{}, errorx.Parser(errorx.GetMessage(`rating with same numeric value exist`, http.StatusUnprocessableEntity))
		}
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(rating.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(rating.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Rating{}, errorx.Parser(errorx.DecodeError())
		}

		jsonDescription, err = util.GetJSONDescription(rating.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Rating{}, errorx.Parser(errorx.DecodeError())
		}
	}

	tx := config.DB.Begin()

	updateMap := map[string]interface{}{
		"created_at":        rating.CreatedAt,
		"updated_at":        rating.UpdatedAt,
		"updated_by_id":     uint(uID),
		"name":              rating.Name,
		"slug":              ratingSlug,
		"background_colour": rating.BackgroundColour,
		"text_colour":       rating.TextColour,
		"medium_id":         rating.MediumID,
		"description":       jsonDescription,
		"description_html":  descriptionHTML,
		"numeric_value":     rating.NumericValue,
		"meta_fields":       rating.MetaFields,
		"meta":              rating.Meta,
		"header_code":       rating.HeaderCode,
		"footer_code":       rating.FooterCode,
	}

	if rating.MediumID == 0 {
		updateMap["medium_id"] = nil
	}

	err = tx.Model(&result).Updates(&updateMap).Preload("Medium").First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Rating{}, errorx.Parser(errorx.DBError())
	}

	tx.Commit()

	return *result, nil
}

func GetRatingService() IRatingService {
	return RatingService{
		model: config.DB.Model(&model.Rating{}),
	}
}

func (rs RatingService) Default(ctx context.Context, sID, uID int, ratings []model.Rating) (ratingPaging, []errorx.Message) {
	tx := rs.model.WithContext(context.WithValue(ctx, ratingContext, uID)).Begin()

	var err error
	for i := range ratings {
		ratings[i].SpaceID = uint(sID)
		ratings[i].DescriptionHTML, err = util.GetDescriptionHTML(ratings[i].Description)
		if err != nil {
			loggerx.Error(err)
			return ratingPaging{}, errorx.Parser(errorx.DecodeError())
		}

		ratings[i].BackgroundColour, err = util.GetJSONDescription(ratings[i].BackgroundColour)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			return ratingPaging{}, errorx.Parser(errorx.DecodeError())
		}

		tx.Model(&model.Rating{}).FirstOrCreate(&ratings[i], &ratings[i])

	}
	result := ratingPaging{}
	result.Nodes = ratings
	result.Total = int64(len(ratings))
	tx.Commit()
	return result, nil

}
