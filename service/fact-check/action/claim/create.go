package claim

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
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
	if claim.Slug != "" && slug.Check(claim.Slug) {
		claimSlug = claim.Slug
	} else {
		claimSlug = slug.Make(claim.Title)
	}

	result := &model.Claim{
		Title:         claim.Title,
		Slug:          slug.Approve(claimSlug, sID, tableName),
		ClaimDate:     claim.ClaimDate,
		CheckedDate:   claim.CheckedDate,
		ClaimSources:  claim.ClaimSources,
		Description:   claim.Description,
		ClaimantID:    claim.ClaimantID,
		RatingID:      claim.RatingID,
		Review:        claim.Review,
		ReviewTagLine: claim.ReviewTagLine,
		ReviewSources: claim.ReviewSources,
		SpaceID:       uint(sID),
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	err = tx.Model(&model.Claim{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Claim{}).Preload("Rating").Preload("Rating.Medium").Preload("Claimant").Preload("Claimant.Medium").Find(&result)

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":              result.ID,
		"kind":            "claim",
		"title":           result.Title,
		"slug":            result.Slug,
		"description":     result.Description,
		"claim_date":      result.ClaimDate.Unix(),
		"checked_date":    result.CheckedDate.Unix(),
		"claim_sources":   result.ClaimSources,
		"claimant_id":     result.ClaimantID,
		"rating_id":       result.RatingID,
		"review":          result.Review,
		"review_tag_line": result.ReviewTagLine,
		"review_sources":  result.ReviewSources,
		"space_id":        result.SpaceID,
	}

	err = meilisearchx.AddDocument("dega", meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusCreated, result)
}
