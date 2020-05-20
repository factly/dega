package rating

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
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
// @Param rating_id path string true "Rating ID"
// @Param Rating body rating false "Rating"
// @Success 200 {object} model.Rating
// @Router /factcheck/ratings/{rating_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	ratingID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(ratingID)

	if err != nil {
		return
	}

	req := &model.Rating{}
	json.NewDecoder(r.Body).Decode(&req)

	rating := &model.Rating{}
	rating.ID = uint(id)

	config.DB.Model(&model.Rating{}).Updates(model.Rating{
		Name:        req.Name,
		Slug:        req.Slug,
		MediumID:    req.MediumID,
		Description: req.Description,
	}).Preload("Medium").First(&rating)

	render.JSON(w, http.StatusOK, rating)
}
