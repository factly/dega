package service

import (
	"context"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/x/errorx"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// rating model
type rating struct {
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
	Create(ctx context.Context, sID, uID int, tag *rating) (model.Rating, []errorx.Message)
	Update(sID, uID int, tag *rating) (model.Rating, []errorx.Message)
	Delete(sID, id int64) []errorx.Message
}

var userContext config.ContextKey = "rating_user"

type RatingService struct {
	model *gorm.DB
}

// Create implements IRatingService
func (RatingService) Create(ctx context.Context, sID int, uID int, tag *rating) (model.Rating, []errorx.Message) {
	panic("unimplemented")
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
func (RatingService) Update(sID int, uID int, tag *rating) (model.Rating, []errorx.Message) {
	panic("unimplemented")
}

func GetRatingService() IRatingService {
	return RatingService{
		model: config.DB.Model(&model.Rating{}),
	}
}
