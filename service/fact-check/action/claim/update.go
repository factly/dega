package claim

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

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
	"github.com/go-chi/chi"
	"gorm.io/gorm"
)

// update - Update claim by id
// @Summary Update a claim by id
// @Description Update claim by ID
// @Tags Claim
// @ID update-claim-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param claim_id path string true "Claim ID"
// @Param Claim body claim false "Claim"
// @Success 200 {object} model.Claim
// @Router /fact-check/claims/{claim_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

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

	claimID := chi.URLParam(r, "claim_id")
	id, err := strconv.Atoi(claimID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
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

	result := &model.Claim{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Claim{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	var claimSlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Claim{})
	tableName := stmt.Schema.Table

	if result.Slug == claim.Slug {
		claimSlug = result.Slug
	} else if claim.Slug != "" && slugx.Check(claim.Slug) {
		claimSlug = slugx.Approve(&config.DB, claim.Slug, sID, tableName)
	} else {
		claimSlug = slugx.Approve(&config.DB, slugx.Make(claim.Title), sID, tableName)
	}

	tx := config.DB.Begin()
	err = tx.Model(&result).Updates(model.Claim{
		Base:          config.Base{UpdatedByID: uint(uID)},
		Title:         claim.Title,
		Slug:          claimSlug,
		ClaimDate:     claim.ClaimDate,
		CheckedDate:   claim.CheckedDate,
		ClaimSources:  claim.ClaimSources,
		Description:   claim.Description,
		ClaimantID:    claim.ClaimantID,
		RatingID:      claim.RatingID,
		Review:        claim.Review,
		ReviewTagLine: claim.ReviewTagLine,
		ReviewSources: claim.ReviewSources,
	}).Preload("Rating").Preload("Rating.Medium").Preload("Claimant").Preload("Claimant.Medium").First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Update into meili index
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

	err = meilisearchx.UpdateDocument("dega", meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	if err = util.NC.Publish("claim.updated", result); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
