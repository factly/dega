package claimant

import (
	"encoding/json"
	"errors"
	"net/http"
	"reflect"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/test"
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

	uID, err := middlewarex.GetUser(r.Context())
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

	// Store HTML description
	var description string
	if len(claimant.Description.RawMessage) > 0 && !reflect.DeepEqual(claimant.Description, test.NilJsonb()) {
		description, err = util.HTMLDescription(claimant.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse claimant description", http.StatusUnprocessableEntity)))
			return
		}
	}

	tx := config.DB.Begin()

	mediumID := &claimant.MediumID
	result.MediumID = &claimant.MediumID
	if claimant.MediumID == 0 {
		err = tx.Model(&result).Updates(map[string]interface{}{"medium_id": nil}).Error
		mediumID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	err = tx.Model(&result).Updates(model.Claimant{
		Base:            config.Base{UpdatedByID: uint(uID)},
		Name:            claimant.Name,
		Slug:            claimantSlug,
		MediumID:        mediumID,
		TagLine:         claimant.TagLine,
		Description:     claimant.Description,
		HTMLDescription: description,
		MetaFields:      claimant.MetaFields,
	}).Preload("Medium").First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

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

	if config.SearchEnabled() {
		_ = meilisearchx.UpdateDocument("dega", meiliObj)
	}

	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("claimant.updated", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
