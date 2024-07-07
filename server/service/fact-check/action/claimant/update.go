package claimant

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
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

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	claimantID := chi.URLParam(r, "claimant_id")
	id, err := uuid.Parse(claimantID)

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
	result.ID = id

	// check record exists or not
	err = config.DB.Where(&model.Claimant{
		Base: config.Base{
			ID: id,
		},
		SpaceID: authCtx.SpaceID,
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
	} else if claimant.Slug != "" && util.CheckSlug(claimant.Slug) {
		claimantSlug = util.ApproveSlug(claimant.Slug, authCtx.SpaceID, tableName)
	} else {
		claimantSlug = util.ApproveSlug(util.MakeSlug(claimant.Name), authCtx.SpaceID, tableName)
	}

	// Check if claimant with same name exist
	if claimant.Name != result.Name && util.CheckName(authCtx.SpaceID, claimant.Name, tableName) {
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
		"updated_by_id":    authCtx.UserID,
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
		_ = meilisearch.UpdateDocument("dega", meiliObj)
	}

	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("claimant.updated", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("claimant.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
