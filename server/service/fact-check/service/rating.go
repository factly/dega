package service

import (
	"context"
	"errors"
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

type IRatingService interface {
	GetById(sID, id int) (model.Rating, error)
	List(sID int64, offset, limit int, searchQuery, sort string) (paging, []errorx.Message)
	Create(ctx context.Context, sID, uID int, rating *Rating) (model.Rating, []errorx.Message)
	Update(sID, uID int, tag *Rating) (model.Rating, []errorx.Message)
	Delete(sID, id int64) []errorx.Message
}

var userContext config.ContextKey = "rating_user"

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
	// check  if  tag name exists
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
		return model.Rating{}, errorx.Parser(errorx.GetMessage("rating with same numeric value exists", 409))
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

	tx := config.DB.WithContext(context.WithValue(ctx, userContext, uID)).Begin()
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
func (RatingService) Delete(sID int64, id int64) []errorx.Message {
	panic("unimplemented")
}

// GetById implements IRatingService
func (rs RatingService) GetById(sID int, id int) (model.Rating, error) {
	result := &model.Rating{}

	result.ID = uint(id)

	err := rs.model.Where(&model.Rating{SpaceID: uint(sID)}).First(&result).Error

	return *result, err
}

// List implements IRatingService
func (RatingService) List(sID int64, offset int, limit int, searchQuery string, sort string) (paging, []errorx.Message) {
	panic("unimplemented")
}

// Update implements IRatingService
func (RatingService) Update(sID int, uID int, tag *Rating) (model.Rating, []errorx.Message) {
	panic("unimplemented")
}

func GetRatingService() IRatingService {
	return RatingService{
		model: config.DB.Model(&model.Rating{}),
	}
}
