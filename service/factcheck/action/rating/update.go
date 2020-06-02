package rating

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
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
// @Param space_id path string true "Space ID"
// @Param rating_id path string true "Rating ID"
// @Param Rating body rating false "Rating"
// @Success 200 {object} model.Rating
// @Router /{space_id}/factcheck/ratings/{rating_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	ratingID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(ratingID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	if err != nil {
		return
	}

	rating := &rating{}
	json.NewDecoder(r.Body).Decode(&rating)

	result := &model.Rating{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Rating{
		SpaceID: uint(sid),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	config.DB.Model(&result).Updates(model.Rating{
		Name:        rating.Name,
		Slug:        rating.Slug,
		MediumID:    rating.MediumID,
		Description: rating.Description,
	}).Preload("Medium").First(&result)

	render.JSON(w, http.StatusOK, result)
}
