package rating

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/errors"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
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
// @Router /factcheck/ratings [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errors.Parser(w, r, errors.InternalServerError, 500)
		return
	}

	rating := &rating{}

	json.NewDecoder(r.Body).Decode(&rating)

	validationError := validationx.Check(rating)

	if validationError != nil {
		renderx.JSON(w, http.StatusBadRequest, validationError)
		return
	}

	var ratingSlug string
	if rating.Slug != "" && slug.Check(rating.Slug) {
		ratingSlug = rating.Slug
	} else {
		ratingSlug = slug.Make(rating.Name)
	}

	result := &model.Rating{
		Name:         rating.Name,
		Slug:         slug.Approve(ratingSlug, sID, config.DB.NewScope(&model.Rating{}).TableName()),
		Description:  rating.Description,
		MediumID:     rating.MediumID,
		SpaceID:      uint(sID),
		NumericValue: rating.NumericValue,
	}

	err = config.DB.Model(&model.Rating{}).Create(&result).Error

	if err != nil {
		return
	}

	config.DB.Model(&model.Rating{}).Preload("Medium").First(&result)

	renderx.JSON(w, http.StatusCreated, result)
}
