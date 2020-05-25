package rating

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
	"github.com/go-playground/validator/v10"
)

// create - Create rating
// @Summary Create rating
// @Description Create rating
// @Tags Rating
// @ID add-rating
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param Rating body rating true "Rating Object"
// @Success 201 {object} model.Rating
// @Failure 400 {array} string
// @Router /factcheck/ratings [post]
func create(w http.ResponseWriter, r *http.Request) {

	rating := &rating{}

	json.NewDecoder(r.Body).Decode(&rating)

	validate := validator.New()

	err := validate.Struct(rating)

	if err != nil {
		msg := err.Error()
		validation.ValidErrors(w, r, msg)
		return
	}

	result := &model.Rating{
		Name:         rating.Name,
		Slug:         rating.Slug,
		Description:  rating.Description,
		MediumID:     rating.MediumID,
		SpaceID:      rating.SpaceID,
		NumericValue: rating.NumericValue,
	}

	err = config.DB.Model(&model.Rating{}).Create(&result).Error

	if err != nil {
		return
	}

	config.DB.Model(&model.Rating{}).Preload("Medium").First(&result)

	render.JSON(w, http.StatusCreated, result)
}
