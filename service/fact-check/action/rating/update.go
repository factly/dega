package rating

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meili"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
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

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
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
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	var ratingSlug string

	if result.Slug == rating.Slug {
		ratingSlug = result.Slug
	} else if rating.Slug != "" && slug.Check(rating.Slug) {
		ratingSlug = slug.Approve(rating.Slug, sID, config.DB.NewScope(&model.Rating{}).TableName())
	} else {
		ratingSlug = slug.Approve(slug.Make(rating.Name), sID, config.DB.NewScope(&model.Rating{}).TableName())
	}

	// Check if rating with same name exist
	if rating.Name != result.Name && util.CheckName(uint(sID), rating.Name, config.DB.NewScope(&model.Rating{}).TableName()) {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	tx := config.DB.Begin()

	if rating.MediumID == 0 {
		err = tx.Model(result).Updates(map[string]interface{}{"medium_id": nil}).First(&result).Error
		result.MediumID = 0
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	err = tx.Model(&result).Updates(model.Rating{
		Name:         rating.Name,
		Slug:         ratingSlug,
		MediumID:     rating.MediumID,
		Description:  rating.Description,
		NumericValue: rating.NumericValue,
	}).Preload("Medium").First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":            result.ID,
		"kind":          "rating",
		"name":          result.Name,
		"slug":          result.Slug,
		"description":   result.Description,
		"numeric_value": result.NumericValue,
		"space_id":      result.SpaceID,
	}

	err = meili.UpdateDocument(meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, result)
}
