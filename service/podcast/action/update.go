package podcast

import (
	"encoding/json"
	"errors"
	"net/http"
	"reflect"
	"strconv"

	"github.com/factly/dega-server/config"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/podcast/model"
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

// update - Update podcast by id
// @Summary Update a podcast by id
// @Description Update podcast by ID
// @Tags Podcast
// @ID update-podcast-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param podcast_id path string true "Podcast ID"
// @Param X-Space header string true "Space ID"
// @Param Podcast body podcast false "Podcast"
// @Success 200 {object} model.Podcast
// @Router /podcast/{podcast_id} [put]
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

	podcastID := chi.URLParam(r, "podcast_id")
	id, err := strconv.Atoi(podcastID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	podcast := &podcast{}
	err = json.NewDecoder(r.Body).Decode(&podcast)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(podcast)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := &model.Podcast{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Podcast{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	var podcastSlug string

	// Get table title
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Podcast{})
	tableName := stmt.Schema.Table

	if result.Slug == podcast.Slug {
		podcastSlug = result.Slug
	} else if podcast.Slug != "" && slugx.Check(podcast.Slug) {
		podcastSlug = slugx.Approve(&config.DB, podcast.Slug, sID, tableName)
	} else {
		podcastSlug = slugx.Approve(&config.DB, slugx.Make(podcast.Title), sID, tableName)
	}

	// Check if podcast with same title exist
	if podcast.Title != result.Title && util.CheckName(uint(sID), podcast.Title, tableName) {
		loggerx.Error(errors.New(`podcast with same title exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	// Store HTML description
	var description string
	if len(podcast.Description.RawMessage) > 0 && !reflect.DeepEqual(podcast.Description, test.NilJsonb()) {
		description, err = util.HTMLDescription(podcast.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse podcast description", http.StatusUnprocessableEntity)))
			return
		}
	}

	tx := config.DB.Begin()

	newCategories := make([]coreModel.Category, 0)
	if len(podcast.CategoryIDs) > 0 {
		config.DB.Model(&coreModel.Category{}).Where(podcast.CategoryIDs).Find(&newCategories)
		if err = tx.Model(&result).Association("Categories").Replace(&newCategories); err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else {
		_ = config.DB.Model(&result).Association("Categories").Clear()
	}

	mediumID := &podcast.MediumID
	result.MediumID = &podcast.MediumID
	if podcast.MediumID == 0 {
		err = tx.Model(&result).Omit("Categories").Updates(map[string]interface{}{"medium_id": nil}).Error
		mediumID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	primaryCategoryID := &podcast.PrimaryCategoryID
	result.PrimaryCategoryID = &podcast.PrimaryCategoryID
	if podcast.PrimaryCategoryID == 0 {
		err = tx.Model(&result).Omit("Categories").Updates(map[string]interface{}{"primary_category_id": nil}).Error
		primaryCategoryID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	tx.Model(&result).Omit("Categories").Updates(model.Podcast{
		Base:              config.Base{UpdatedByID: uint(uID)},
		HTMLDescription:   description,
		Description:       podcast.Description,
		Slug:              slugx.Approve(&config.DB, podcastSlug, sID, tableName),
		Language:          podcast.Language,
		MediumID:          mediumID,
		PrimaryCategoryID: primaryCategoryID,
		HeaderCode:        podcast.HeaderCode,
		FooterCode:        podcast.FooterCode,
		SpaceID:           uint(sID),
	}).Preload("Categories").Preload("Medium").First(&result)

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":           result.ID,
		"kind":         "podcast",
		"title":        result.Title,
		"slug":         result.Slug,
		"description":  result.Description,
		"language":     result.Language,
		"category_ids": podcast.CategoryIDs,
		"space_id":     result.SpaceID,
		"medium_id":    result.MediumID,
	}

	err = meilisearchx.UpdateDocument("dega", meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("podcast.updated", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
