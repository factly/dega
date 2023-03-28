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

type paging struct {
	Total int        `json:"total"`
	Nodes []Claimant `json:"nodes"`
}

// Claimant model
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

type IClaimantService interface {
	GetById(sID, id int) (model.Claimant, error)
	List(sID uint, offset, limit int, searchQuery, sort string) (paging, []errorx.Message)
	Create(ctx context.Context, sID, uID int, tag *Claimant) (model.Claimant, []errorx.Message)
	Update(sID, uID, id int, tag *Claimant) (model.Claimant, []errorx.Message)
	Delete(sID, id int) []errorx.Message
}

type claimantService struct {
	model *gorm.DB
}

// Create implements IClaimantService
func (claimantService) Create(ctx context.Context, sID int, uID int, tag *Claimant) (model.Claimant, []errorx.Message) {
	panic("unimplemented")
}

// Delete implements IClaimantService
func (claimantService) Delete(sID int, id int) []errorx.Message {
	panic("unimplemented")
}

// GetById implements IClaimantService
func (cs claimantService) GetById(sID int, id int) (model.Claimant, error) {

	result := model.Claimant{}
	result.ID = uint(id)

	err := cs.model.Where(&model.Claimant{SpaceID: uint(sID)}).First(&result).Error

	return result, err
}

// List implements IClaimantService
func (claimantService) List(sID uint, offset int, limit int, searchQuery string, sort string) (paging, []errorx.Message) {
	panic("unimplemented")
}

// Update implements IClaimantService
func (claimantService) Update(sID int, uID int, id int, tag *Claimant) (model.Claimant, []errorx.Message) {
	panic("unimplemented")
}

func GetClaimantService() IClaimantService {
	return &claimantService{model: config.DB}
}
