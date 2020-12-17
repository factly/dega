package rating

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meili"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"gorm.io/gorm"
)

// create - Create rating
// @Summary Create rating
// @Description Create rating
// @Tags Rating
// @ID add-rating
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Rating body rating true "Rating Object"
// @Success 201 {object} model.Rating
// @Failure 400 {array} string
// @Router /fact-check/ratings [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
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

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Rating{})
	tableName := stmt.Schema.Table

	var ratingSlug string
	if rating.Slug != "" && slug.Check(rating.Slug) {
		ratingSlug = rating.Slug
	} else {
		ratingSlug = slug.Make(rating.Name)
	}

	// Check if rating with same name exist
	if util.CheckName(uint(sID), rating.Name, tableName) {
		loggerx.Error(errors.New(`rating with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

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

	mediumID := &rating.MediumID
	if rating.MediumID == 0 {
		mediumID = nil
	}

	result := &model.Rating{
		Name:         rating.Name,
		Slug:         slug.Approve(ratingSlug, sID, tableName),
		Colour:       rating.Colour,
		Description:  rating.Description,
		MediumID:     mediumID,
		SpaceID:      uint(sID),
		NumericValue: rating.NumericValue,
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	err = tx.Model(&model.Rating{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Rating{}).Preload("Medium").First(&result)

	err = insertIntoMeili(*result)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusCreated, result)
}

func insertIntoMeili(rating model.Rating) error {
	meiliObj := map[string]interface{}{
		"id":            rating.ID,
		"kind":          "rating",
		"name":          rating.Name,
		"colour":        rating.Colour,
		"slug":          rating.Slug,
		"description":   rating.Description,
		"numeric_value": rating.NumericValue,
		"space_id":      rating.SpaceID,
	}

	return meili.AddDocument(meiliObj)
}
