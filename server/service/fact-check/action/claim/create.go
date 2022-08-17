package claim

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// create - Create claim
// @Summary Create claim
// @Description Create claim
// @Tags Claim
// @ID add-claim
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Claim body claim true "Claim Object"
// @Success 201 {object} model.Claim
// @Failure 400 {array} string
// @Router /fact-check/claims [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	claim := &claim{}

	err = json.NewDecoder(r.Body).Decode(&claim)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(claim)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
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

	var htmlDescription string
	var jsonDescription postgres.Jsonb
	if len(claim.Description.RawMessage) > 0 {
		htmlDescription, err = util.GetHTMLDescription(claim.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		jsonDescription, err = util.GetJSONDescription(claim.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
	}

	mediumID := &claim.MediumID
	if claim.MediumID == 0 {
		mediumID = nil
	}

	result := &model.Claim{
		Claim:           claim.Claim,
		Slug:            slugx.Approve(&config.DB, claimSlug, sID, tableName),
		ClaimDate:       claim.ClaimDate,
		CheckedDate:     claim.CheckedDate,
		ClaimSources:    claim.ClaimSources,
		Description:     jsonDescription,
		HTMLDescription: htmlDescription,
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
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	err = tx.Model(&model.Claim{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Claim{}).Preload("Rating").Preload("Rating.Medium").Preload("Claimant").Preload("Claimant.Medium").Preload("Medium").Find(&result)

	var claimMeiliDate int64 = 0
	if result.ClaimDate != nil {
		claimMeiliDate = result.ClaimDate.Unix()
	}
	var checkedMeiliDate int64 = 0
	if result.CheckedDate != nil {
		checkedMeiliDate = result.CheckedDate.Unix()
	}
	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":             result.ID,
		"kind":           "claim",
		"claim":          result.Claim,
		"slug":           result.Slug,
		"description":    result.Description,
		"claim_date":     claimMeiliDate,
		"checked_date":   checkedMeiliDate,
		"claim_sources":  result.ClaimSources,
		"claimant_id":    result.ClaimantID,
		"rating_id":      result.RatingID,
		"fact":           result.Fact,
		"review_sources": result.ReviewSources,
		"space_id":       result.SpaceID,
	}

	if config.SearchEnabled() {
		_ = meilisearchx.AddDocument("dega", meiliObj)
	}

	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("claim.created", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusCreated, result)
}
