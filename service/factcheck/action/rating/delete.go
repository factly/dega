package rating

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// delete - Delete rating by id
// @Summary Delete a rating
// @Description Delete rating by ID
// @Tags Rating
// @ID delete-rating-by-id
// @Param X-User header string true "User ID"
// @Param rating_id path string true "Rating ID"
// @Success 200
// @Router /factcheck/ratings/{rating_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	ratingID := chi.URLParam(r, "rating_id")
	id, err := strconv.Atoi(ratingID)

	rating := &model.Rating{}

	rating.ID = uint(id)

	// check record exists or not
	err = config.DB.First(&rating).Error

	if err != nil {
		return
	}

	config.DB.Delete(&rating)

	render.JSON(w, http.StatusOK, nil)
}
