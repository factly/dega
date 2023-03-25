package rating

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	searchService "github.com/factly/dega-server/util/search-service"
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

// update - Update rating by id
// @Summary Update a rating by id
// @Description Update rating by ID
// @Tags Rating
// @ID update-rating-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param rating_id path string true "Rating ID"
// @Param Rating body rating false "Rating"
// @Success 200 {object} model.Rating
// @Router /fact-check/ratings/{rating_id} [put]
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

	ratingID := chi.URLParam(r, "rating_id")
	id, err := strconv.Atoi(ratingID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	rating := &rating{}
	err = json.NewDecoder(r.Body).Decode(&rating)
	// log.Fatal("====", rating.NumericValue)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(rating)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := model.Rating{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Rating{
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

	var ratingSlug string

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Rating{})
	tableName := stmt.Schema.Table

	if result.Slug == rating.Slug {
		ratingSlug = result.Slug
	} else if rating.Slug != "" && slugx.Check(rating.Slug) {
		ratingSlug = slugx.Approve(&config.DB, rating.Slug, sID, tableName)
	} else {
		ratingSlug = slugx.Approve(&config.DB, slugx.Make(rating.Name), sID, tableName)
	}

	// Check if rating with same name exist
	if rating.Name != result.Name && util.CheckName(uint(sID), rating.Name, tableName) {
		loggerx.Error(errors.New(`rating with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	if rating.NumericValue != result.NumericValue {
		// Check if rating with same numeric value exist
		var sameValueRatings int64
		config.DB.Model(&model.Rating{}).Where(&model.Rating{
			SpaceID:      uint(sID),
			NumericValue: rating.NumericValue,
		}).Count(&sameValueRatings)

		if sameValueRatings > 0 {
			loggerx.Error(errors.New(`rating with same numeric value exist`))
			errorx.Render(w, errorx.Parser(errorx.GetMessage(`rating with same numeric value exist`, http.StatusUnprocessableEntity)))
			return
		}
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(rating.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(rating.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		jsonDescription, err = util.GetJSONDescription(rating.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
	}

	tx := config.DB.Begin()

	updateMap := map[string]interface{}{
		"created_at":        rating.CreatedAt,
		"updated_at":        rating.UpdatedAt,
		"updated_by_id":     uint(uID),
		"name":              rating.Name,
		"slug":              ratingSlug,
		"background_colour": rating.BackgroundColour,
		"text_colour":       rating.TextColour,
		"medium_id":         rating.MediumID,
		"description":       jsonDescription,
		"description_html":  descriptionHTML,
		"numeric_value":     rating.NumericValue,
		"meta_fields":       rating.MetaFields,
		"meta":              rating.Meta,
		"header_code":       rating.HeaderCode,
		"footer_code":       rating.FooterCode,
	}

	if rating.MediumID == 0 {
		updateMap["medium_id"] = nil
	}

	err = tx.Model(&result).Updates(&updateMap).Preload("Medium").First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":                result.ID,
		"kind":              "rating",
		"name":              result.Name,
		"slug":              result.Slug,
		"background_colour": rating.BackgroundColour,
		"text_colour":       rating.TextColour,
		"description":       result.Description,
		"numeric_value":     result.NumericValue,
		"space_id":          result.SpaceID,
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
		if util.CheckWebhookEvent("rating.updated", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("rating.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
