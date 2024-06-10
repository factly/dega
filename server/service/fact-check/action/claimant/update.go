package claimant

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

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

// update - Update claimant by id
// @Summary Update a claimant by id
// @Description Update claimant by ID
// @Tags Claimant
// @ID update-claimant-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param claimant_id path string true "Claimant ID"
// @Param Claimant body claimant false "Claimant"
// @Success 200 {object} model.Claimant
// @Router /fact-check/claimants/{claimant_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	claimantID := chi.URLParam(r, "claimant_id")
	id, err := strconv.Atoi(claimantID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	claimant := &claimant{}
	err = json.NewDecoder(r.Body).Decode(&claimant)

	if err != nil {
		println(err)
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(claimant)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := model.Claimant{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Claimant{
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

	var claimantSlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Claimant{})
	tableName := stmt.Schema.Table

	if result.Slug == claimant.Slug {
		claimantSlug = result.Slug
	} else if claimant.Slug != "" && slugx.Check(claimant.Slug) {
		claimantSlug = slugx.Approve(&config.DB, claimant.Slug, sID, tableName)
	} else {
		claimantSlug = slugx.Approve(&config.DB, slugx.Make(claimant.Name), sID, tableName)
	}

	// Check if claimant with same name exist
	if claimant.Name != result.Name && util.CheckName(uint(sID), claimant.Name, tableName) {
		loggerx.Error(errors.New(`claimant with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(claimant.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(claimant.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		jsonDescription, err = util.GetJSONDescription(claimant.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
	}

	tx := config.DB.Begin()
	updateMap := map[string]interface{}{
		"created_at":       claimant.CreatedAt,
		"updated_at":       claimant.UpdatedAt,
		"updated_by_id":    uID,
		"name":             claimant.Name,
		"slug":             claimantSlug,
		"description":      jsonDescription,
		"description_html": descriptionHTML,
		"medium_id":        claimant.MediumID,
		"tag_line":         claimant.TagLine,
		"is_featured":      claimant.IsFeatured,
		"meta_fields":      claimant.MetaFields,
		"meta":             claimant.Meta,
		"header_code":      claimant.HeaderCode,
		"footer_code":      claimant.FooterCode,
	}
	if claimant.MediumID == 0 {
		updateMap["medium_id"] = nil
	}

	if claimant.CreatedAt.IsZero() {
		updateMap["created_at"] = result.CreatedAt
	}

	if claimant.UpdatedAt.IsZero() {
		updateMap["updated_at"] = time.Now()
	}

	err = tx.Model(&result).Updates(&updateMap).Preload("Medium").First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	if config.SearchEnabled() {
		// Update into meili index
		meiliObj := map[string]interface{}{
			"id":          result.ID,
			"kind":        "claimant",
			"name":        result.Name,
			"slug":        result.Slug,
			"description": result.Description,
			"tag_line":    result.TagLine,
			"space_id":    result.SpaceID,
		}
		_ = meilisearchx.UpdateDocument("dega", meiliObj)
	}

	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("claimant.updated", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("claimant.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
