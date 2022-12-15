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
	"github.com/jinzhu/gorm/dialects/postgres"
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
		Base: config.Base{
			ID: uint(id),
		},
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	var claimSlug string

	slug := claim.Slug
	if len(slug) > 150 {
		slug = claim.Slug[:150]
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Claim{})
	tableName := stmt.Schema.Table

	if result.Slug == claim.Slug {
		claimSlug = result.Slug
	} else if claim.Slug != "" && slugx.Check(slug) {
		claimSlug = slugx.Approve(&config.DB, slug, sID, tableName)
	} else {
		if len(claim.Claim) > 150 {
			claimSlug = slugx.Approve(&config.DB, slugx.Make(claim.Claim[:150]), sID, tableName)
		} else {
			claimSlug = slugx.Approve(&config.DB, slugx.Make(claim.Claim), sID, tableName)
		}
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(claim.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(claim.Description)
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

	tx := config.DB.Begin()

	updateMap := map[string]interface{}{
		"created_at":       claim.CreatedAt,
		"updated_at":       claim.UpdatedAt,
		"updated_by_id":    uint(uID),
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
		"is_migrated":      claim.IsMigrated,
		"description_amp":  claim.DescriptionAMP,
		"migrated_html":    claim.MigratedHTML,
	}
	if claim.MediumID == 0 {
		updateMap["medium_id"] = nil
	}

	err = tx.Model(&result).Updates(&updateMap).Preload("Rating").Preload("Rating.Medium").Preload("Claimant").Preload("Claimant.Medium").Preload("Medium").First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	var claimMeiliDate int64 = 0
	if result.ClaimDate != nil {
		claimMeiliDate = result.ClaimDate.Unix()
	}
	var checkedMeiliDate int64 = 0
	if result.CheckedDate != nil {
		checkedMeiliDate = result.CheckedDate.Unix()
	}
	// Update into meili index
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
		_ = meilisearchx.UpdateDocument("dega", meiliObj)
	}

	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("claim.updated", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("claim.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, result)
}
