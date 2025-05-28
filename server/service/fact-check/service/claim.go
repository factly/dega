package service

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/google/uuid"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/validationx"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

type claimPaging struct {
	Total int64         `json:"total"`
	Nodes []model.Claim `json:"nodes"`
}

type Claim struct {
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	Claim          string         `json:"claim" validate:"required,max=5000"`
	Slug           string         `json:"slug"`
	ClaimDate      *time.Time     `json:"claim_date" `
	CheckedDate    *time.Time     `json:"checked_date"`
	ClaimSources   postgres.Jsonb `json:"claim_sources" swaggertype:"primitive,string"`
	Description    postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	ClaimantID     uuid.UUID      `json:"claimant_id" validate:"required"`
	RatingID       uuid.UUID      `json:"rating_id" validate:"required"`
	MediumID       uuid.UUID      `json:"medium_id"`
	Fact           string         `json:"fact"`
	ReviewSources  postgres.Jsonb `json:"review_sources" swaggertype:"primitive,string"`
	MetaFields     postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta           postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode     string         `json:"header_code"`
	FooterCode     string         `json:"footer_code"`
	DescriptionAMP string         `json:"description_amp"`
	MigrationID    *uuid.UUID     `json:"migration_id"`
	MigratedHTML   string         `json:"migrated_html"`
}

type IClaimService interface {
	GetById(sID, id uuid.UUID) (model.Claim, []errorx.Message)
	List(sID uuid.UUID, offset, limit int, searchQuery, sort string, queryMap url.Values) (claimPaging, []errorx.Message)
	Create(ctx context.Context, sID uuid.UUID, uID string, claim *Claim) (model.Claim, []errorx.Message)
	Update(sID, id uuid.UUID, uID string, claim *Claim) (model.Claim, []errorx.Message)
	Delete(sID, id uuid.UUID) []errorx.Message
}

type claimService struct {
	model *gorm.DB
}

// Create implements IClaimService
func (cs *claimService) Create(ctx context.Context, sID uuid.UUID, uID string, claim *Claim) (model.Claim, []errorx.Message) {
	validationError := validationx.Check(claim)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Claim{}, validationError
	}

	// Get table name
	stmt := &gorm.Statement{DB: cs.model}
	_ = stmt.Parse(&model.Claim{})
	tableName := stmt.Schema.Table

	var claimSlug string
	slug := claim.Slug
	if len(slug) > 150 {
		slug = claim.Slug[:150]
	}
	if claim.Slug != "" && util.CheckSlug(slug) {
		claimSlug = slug
	} else {
		if len(claim.Claim) > 150 {
			claimSlug = util.MakeSlug(claim.Claim[:150])
		} else {
			claimSlug = util.MakeSlug(claim.Claim)
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
	if claim.MediumID == uuid.Nil {
		mediumID = nil
	}

	result := &model.Claim{
		Base: config.Base{
			CreatedAt: claim.CreatedAt,
			UpdatedAt: claim.UpdatedAt,
		},
		Claim:           claim.Claim,
		Slug:            util.ApproveSlug(claimSlug, sID, tableName),
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
		SpaceID:         sID,
		MediumID:        mediumID,
		DescriptionAMP:  claim.DescriptionAMP,
		MigrationID:     claim.MigrationID,
		MigratedHTML:    claim.MigratedHTML,
	}

	tx := cs.model.WithContext(context.WithValue(ctx, config.UserContext, uID)).Begin()
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
func (cs *claimService) Delete(sID, id uuid.UUID) []errorx.Message {

	claim := model.Claim{}
	claim.ID = id

	// check if claim is associated with posts
	var totAssociated int64
	cs.model.Model(&model.PostClaim{}).Where(&model.PostClaim{
		ClaimID: id,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("claim is associated with post"))
		return errorx.Parser(errorx.CannotDelete("claim", "post"))
	}

	tx := cs.model.Begin()
	tx.Delete(&claim)

	tx.Commit()

	return nil
}

// GetById implements IClaimService
func (cs *claimService) GetById(sID, id uuid.UUID) (model.Claim, []errorx.Message) {

	result := &model.Claim{}

	result.ID = id

	err := cs.model.Model(&model.Claim{}).Preload("Rating").Preload("Rating.Medium").Preload("Claimant").Preload("Claimant.Medium").Where(&model.Claim{
		SpaceID: sID,
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
func (cs *claimService) List(sID uuid.UUID, offset, limit int, searchQuery, sort string, queryMap url.Values) (claimPaging, []errorx.Message) {
	var result claimPaging
	result.Nodes = make([]model.Claim, 0)
	tx := cs.model.Model(&model.Claim{}).Preload("Rating").Preload("Rating.Medium").Preload("Claimant").Preload("Claimant.Medium").Where(&model.Claim{
		SpaceID: sID,
	}).Order("created_at " + sort)
	var err error
	filters := generateFilters(queryMap["rating"], queryMap["claimant"])
	if filters != "" || searchQuery != "" {
		if config.SearchEnabled() {
			// search claims with filter
			var hits []interface{}
			if filters != "" {
				filters = fmt.Sprint(filters, " AND space_id=", sID)
			}
			hits, err = meilisearch.SearchWithQuery("claim", searchQuery, filters)
			if err != nil {
				loggerx.Error(err)
				return claimPaging{}, errorx.Parser(errorx.NetworkError())
			}

			filteredClaimIDs := meilisearch.GetIDArray(hits)
			if len(filteredClaimIDs) == 0 {
				return result, nil
			} else {
				err = tx.Where(filteredClaimIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
				if err != nil {
					loggerx.Error(err)
					return claimPaging{}, errorx.Parser(errorx.DBError())
				}
			}
		} else {
			// search index is disabled
			filters = generateSQLFilters(searchQuery, queryMap["rating"], queryMap["claimant"])
			err = tx.Where(filters).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
			if err != nil {
				loggerx.Error(err)
				return claimPaging{}, errorx.Parser(errorx.DBError())
			}
		}
	} else {
		// no search parameters
		err = tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			return claimPaging{}, errorx.Parser(errorx.DBError())
		}
	}

	return result, nil
}

// Update implements IClaimService
func (cs *claimService) Update(sID, id uuid.UUID, uID string, claim *Claim) (model.Claim, []errorx.Message) {

	validationError := validationx.Check(claim)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		return model.Claim{}, validationError
	}

	result := &model.Claim{}
	result.ID = id
	var err error
	// check record exists or not
	err = cs.model.Where(&model.Claim{
		Base: config.Base{
			ID: id,
		},
		SpaceID: sID,
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		return model.Claim{}, errorx.Parser(errorx.RecordNotFound())
	}

	var claimSlug string

	slug := claim.Slug
	if len(slug) > 150 {
		slug = claim.Slug[:150]
	}

	// Get table name
	stmt := &gorm.Statement{DB: cs.model}
	_ = stmt.Parse(&model.Claim{})
	tableName := stmt.Schema.Table

	if result.Slug == claim.Slug {
		claimSlug = result.Slug
	} else if claim.Slug != "" && util.CheckSlug(slug) {
		claimSlug = util.ApproveSlug(slug, sID, tableName)
	} else {
		if len(claim.Claim) > 150 {
			claimSlug = util.ApproveSlug(util.MakeSlug(claim.Claim[:150]), sID, tableName)
		} else {
			claimSlug = util.ApproveSlug(util.MakeSlug(claim.Claim), sID, tableName)
		}
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
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

	tx := cs.model.Begin()

	updateMap := map[string]interface{}{
		"created_at":       claim.CreatedAt,
		"updated_at":       claim.UpdatedAt,
		"updated_by_id":    uID,
		"claim":            claim.Claim,
		"slug":             claimSlug,
		"claim_sources":    claim.ClaimSources,
		"description":      jsonDescription,
		"description_html": descriptionHTML,
		"claimant_id":      claim.ClaimantID,
		"rating_id":        claim.RatingID,
		"fact":             claim.Fact,
		"review_sources":   claim.ReviewSources,
		"meta_fields":      claim.MetaFields,
		"claim_date":       claim.ClaimDate,
		"checked_date":     claim.CheckedDate,
		"meta":             claim.Meta,
		"header_code":      claim.HeaderCode,
		"footer_code":      claim.FooterCode,
		"medium_id":        claim.MediumID,
		"description_amp":  claim.DescriptionAMP,
		"migrated_html":    claim.MigratedHTML,
	}

	if claim.MigrationID != nil {
		updateMap["migration_id"] = *claim.MigrationID
	}

	if claim.MediumID == uuid.Nil {
		updateMap["medium_id"] = nil
	}
	// check if claimant with claimant_id exists also check if claimant belongs to same space
	var claimant model.Claimant
	err = tx.Model(&model.Claimant{}).Where("id = ? AND space_id = ?", claim.ClaimantID, sID).First(&claimant).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Claim{}, errorx.Parser(errorx.InternalServerError())
	}

	// check if rating with rating_id exists also check if rating belongs to same space
	var rating model.Rating
	err = tx.Model(&model.Rating{}).Where("id = ? AND space_id = ?", claim.RatingID, sID).First(&rating).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Claim{}, errorx.Parser(errorx.InternalServerError())
	}

	err = tx.Model(&result).Updates(&updateMap).Preload("Rating").Preload("Rating.Medium").Preload("Claimant").Preload("Claimant.Medium").Preload("Medium").First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return model.Claim{}, errorx.Parser(errorx.DBError())
	}

	tx.Commit()

	return *result, nil
}

func GetClaimService() IClaimService {
	return &claimService{model: config.DB}
}

func generateSQLFilters(searchQuery string, ratingsIDs, claimantIDs []string) string {
	filters := ""
	if config.Sqlite() {
		if searchQuery != "" {
			filters = fmt.Sprint(filters, "claim LIKE '%", strings.ToLower(searchQuery), "%'", "OR fact LIKE '%", strings.ToLower(searchQuery), "%'", " AND ")
		}

	} else {
		if searchQuery != "" {
			filters = fmt.Sprint(filters, "claim ILIKE '%", strings.ToLower(searchQuery), "%'", "OR fact ILIKE '%", strings.ToLower(searchQuery), "%'", " AND ")
		}
	}

	if len(ratingsIDs) > 0 {
		filters = filters + " rating_id IN ("
		for _, id := range ratingsIDs {
			filters = fmt.Sprint(filters, id, ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if len(claimantIDs) > 0 {
		filters = filters + " claimant_id IN ("
		for _, id := range claimantIDs {
			filters = fmt.Sprint(filters, id, ", ")
		}
		filters = fmt.Sprint("(", strings.Trim(filters, ", "), ")) AND ")
	}

	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}

func generateFilters(ratingIDs, claimantIDs []string) string {
	filters := ""

	if len(ratingIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearch.GenerateFieldFilter(ratingIDs, "rating_id"), " AND ")
	}
	if len(claimantIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearch.GenerateFieldFilter(claimantIDs, "claimant_id"), " AND ")
	}
	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}
