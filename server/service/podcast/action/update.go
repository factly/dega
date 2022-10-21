package podcast

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	coreModel "github.com/factly/dega-server/service/core/model"
	searchService "github.com/factly/dega-server/util/search-service"

	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
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

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(podcast.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(podcast.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		jsonDescription, err = util.GetJSONDescription(podcast.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
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

	updateMap := map[string]interface{}{
		"created_at":          podcast.CreatedAt,
		"updated_at":          podcast.UpdatedAt,
		"updated_by_id":       uint(uID),
		"title":               podcast.Title,
		"slug":                podcastSlug,
		"description_html":    descriptionHTML,
		"description":         jsonDescription,
		"medium_id":           podcast.MediumID,
		"meta_fields":         podcast.MetaFields,
		"language":            podcast.Language,
		"primary_category_id": podcast.PrimaryCategoryID,
		"header_code":         podcast.HeaderCode,
		"footer_code":         podcast.FooterCode,
	}

	if podcast.MediumID == 0 {
		updateMap["medium_id"] = nil
	}

	if podcast.PrimaryCategoryID == 0 {
		updateMap["primary_category_id"] = nil
	}

	tx.Model(&result).Omit("Categories").Updates(&updateMap).Preload("Categories").Preload("Medium").First(&result)

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

	if config.SearchEnabled() {
		err = searchService.GetSearchService().Update(meiliObj)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("podcast.updated", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("podcast.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
