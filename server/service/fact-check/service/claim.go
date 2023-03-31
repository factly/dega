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

type paging struct {
	Total int64         `json:"total"`
	Nodes []model.Claim `json:"nodes"`
}

var userContext config.ContextKey = "claim_user"

type Claim struct {
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	Claim          string         `json:"claim" validate:"required,max=5000"`
	Slug           string         `json:"slug"`
	ClaimDate      *time.Time     `json:"claim_date" `
	CheckedDate    *time.Time     `json:"checked_date"`
	ClaimSources   postgres.Jsonb `json:"claim_sources" swaggertype:"primitive,string"`
	Description    postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	ClaimantID     uint           `json:"claimant_id" validate:"required"`
	RatingID       uint           `json:"rating_id" validate:"required"`
	MediumID       uint           `json:"medium_id"`
	Fact           string         `json:"fact"`
	ReviewSources  postgres.Jsonb `json:"review_sources" swaggertype:"primitive,string"`
	MetaFields     postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta           postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode     string         `json:"header_code"`
	FooterCode     string         `json:"footer_code"`
	DescriptionAMP string         `json:"description_amp"`
	MigrationID    *uint          `json:"migration_id"`
	MigratedHTML   string         `json:"migrated_html"`
}

type IClaimService interface {
	GetById(sID, id int) (model.Claim, []errorx.Message)
	List(sID uint, offset, limit int, searchQuery, sort string) (paging, []errorx.Message)
	Create(ctx context.Context, sID, uID int, claim *Claim) (model.Claim, []errorx.Message)
	Update(sID, uID, id int, claim *Claim) (model.Claim, []errorx.Message)
	Delete(sID, id int) []errorx.Message
}

type claimService struct {
	model *gorm.DB
}

// Create implements IClaimService
func (*claimService) Create(ctx context.Context, sID int, uID int, claim *Claim) (model.Claim, []errorx.Message) {
	validationError := validationx.Check(claim)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Claim{}, validationError
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Claim{})
	tableName := stmt.Schema.Table

	var claimSlug string
	slug := claim.Slug
	if len(slug) > 150 {
		slug = claim.Slug[:150]
	}
	if claim.Slug != "" && slugx.Check(slug) {
		claimSlug = slug
	} else {
		if len(claim.Claim) > 150 {
			claimSlug = slugx.Make(claim.Claim[:150])
		} else {
			claimSlug = slugx.Make(claim.Claim)
		}
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	var err error
	if len(claim.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(claim.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Claim{}, errorx.Parser(errorx.DecodeError())
		}

		jsonDescription, err = util.GetJSONDescription(claim.Description)
		if err != nil {
			loggerx.Error(err)
			return model.Claim{}, errorx.Parser(errorx.DecodeError())
		}
	}

	mediumID := &claim.MediumID
	if claim.MediumID == 0 {
		mediumID = nil
	}

	result := &model.Claim{
		Base: config.Base{
			CreatedAt: claim.CreatedAt,
			UpdatedAt: claim.UpdatedAt,
		},
		Claim:           claim.Claim,
		Slug:            slugx.Approve(&config.DB, claimSlug, sID, tableName),
		ClaimDate:       claim.ClaimDate,
		CheckedDate:     claim.CheckedDate,
		ClaimSources:    claim.ClaimSources,
		Description:     jsonDescription,
		DescriptionHTML: descriptionHTML,
		ClaimantID:      claim.ClaimantID,
		RatingID:        claim.RatingID,
		Fact:            claim.Fact,
		ReviewSources:   claim.ReviewSources,
		MetaFields:      claim.MetaFields,
		Meta:            claim.Meta,
		HeaderCode:      claim.HeaderCode,
		FooterCode:      claim.FooterCode,
		SpaceID:         uint(sID),
		MediumID:        mediumID,
		DescriptionAMP:  claim.DescriptionAMP,
		MigrationID:     claim.MigrationID,
		MigratedHTML:    claim.MigratedHTML,
	}

	tx := config.DB.WithContext(context.WithValue(ctx, userContext, uID)).Begin()
	err = tx.Model(&model.Claim{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Claim{}, errorx.Parser(errorx.DBError())
	}

	tx.Model(&model.Claim{}).Preload("Rating").Preload("Rating.Medium").Preload("Claimant").Preload("Claimant.Medium").Preload("Medium").Find(&result)
	tx.Commit()

	return *result, nil
}

// Delete implements IClaimService
func (*claimService) Delete(sID int, id int) []errorx.Message {

	claim := model.Claim{}
	claim.ID = uint(id)

	// check if claim is associated with posts
	var totAssociated int64
	config.DB.Model(&model.PostClaim{}).Where(&model.PostClaim{
		ClaimID: uint(id),
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("claim is associated with post"))
		return errorx.Parser(errorx.CannotDelete("claim", "post"))
	}

	tx := config.DB.Begin()
	tx.Delete(&claim)

	tx.Commit()

	return nil
}

// GetById implements IClaimService
func (*claimService) GetById(sID int, id int) (model.Claim, []errorx.Message) {

	result := &model.Claim{}

	result.ID = uint(id)

	err := config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Rating.Medium").Preload("Claimant").Preload("Claimant.Medium").Where(&model.Claim{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			loggerx.Error(err)
			return model.Claim{}, errorx.Parser(errorx.RecordNotFound())
		}
		loggerx.Error(err)
		return model.Claim{}, errorx.Parser(errorx.DBError())
	}

	return *result, nil
}

// List implements IClaimService
func (*claimService) List(sID uint, offset int, limit int, searchQuery string, sort string) (paging, []errorx.Message) {
	panic("unimplemented")
}

// Update implements IClaimService
func (*claimService) Update(sID int, uID int, id int, claim *Claim) (model.Claim, []errorx.Message) {
	panic("unimplemented")
}

func GetClaimService() IClaimService {
	return &claimService{model: config.DB}
}
